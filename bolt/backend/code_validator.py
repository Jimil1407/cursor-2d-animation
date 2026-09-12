"""Static safety checks for Manim scene code before it is executed.

The render pipeline writes a Python file to disk and hands it to the ``manim``
CLI, which imports and executes it. That code comes from an LLM *and* from
whatever a user types into the in-app editor, so it is untrusted input and must
be screened before it can run.

The check is an allowlist: anything not explicitly permitted is rejected. It is
a hardening layer, not a sandbox — untrusted rendering should additionally run
in an isolated container with no credentials mounted.
"""

import ast
from typing import Iterable

# Modules a legitimate Manim scene may need.
ALLOWED_IMPORT_ROOTS = frozenset(
    {
        "manim",
        "numpy",
        "math",
        "cmath",
        "random",
        "itertools",
        "functools",
        "operator",
        "statistics",
        "fractions",
        "decimal",
        "collections",
        "dataclasses",
        "enum",
        "typing",
        "string",
        "colour",
        "scipy",
    }
)

# Builtins that grant filesystem, network or interpreter access.
FORBIDDEN_BUILTINS = frozenset(
    {
        "eval",
        "exec",
        "compile",
        "open",
        "input",
        "breakpoint",
        "exit",
        "quit",
        "globals",
        "locals",
        "vars",
        "getattr",
        "setattr",
        "delattr",
        "__import__",
        "memoryview",
    }
)


class UnsafeCodeError(ValueError):
    """Raised when scene code fails the safety screen."""


def _iter_import_roots(node: ast.AST) -> Iterable[str]:
    if isinstance(node, ast.Import):
        for alias in node.names:
            yield alias.name.split(".")[0]
    elif isinstance(node, ast.ImportFrom):
        # ``from . import x`` has no module; relative imports are not allowed.
        yield (node.module or "").split(".")[0]


def validate_scene_code(code: str) -> None:
    """Raise :class:`UnsafeCodeError` if *code* is not a safe Manim scene."""
    if not code or not code.strip():
        raise UnsafeCodeError("Scene code is empty.")

    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        raise UnsafeCodeError(f"Scene code is not valid Python: {exc.msg} (line {exc.lineno})") from exc

    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            if isinstance(node, ast.ImportFrom) and node.level:
                raise UnsafeCodeError("Relative imports are not allowed in scene code.")
            for root in _iter_import_roots(node):
                if root not in ALLOWED_IMPORT_ROOTS:
                    raise UnsafeCodeError(f"Import of '{root}' is not allowed in scene code.")

        elif isinstance(node, ast.Name) and node.id in FORBIDDEN_BUILTINS:
            raise UnsafeCodeError(f"Use of '{node.id}' is not allowed in scene code.")

        elif isinstance(node, ast.Attribute) and node.attr.startswith("__"):
            # Blocks __class__/__subclasses__/__globals__ sandbox-escape chains.
            raise UnsafeCodeError(f"Access to '{node.attr}' is not allowed in scene code.")
