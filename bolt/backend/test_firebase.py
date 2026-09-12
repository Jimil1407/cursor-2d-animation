"""Manual smoke test: render a scene and publish it.

Run with ``python test_firebase.py`` from the backend directory.
"""

from manim_engine import save_and_render

TEST_UID = "smoke-test-user"

TEST_CODE = """
from manim import *

class MorphScene(Scene):
    def construct(self):
        circle = Circle()
        self.play(Create(circle))
        self.wait(1)

        square = Square()
        self.play(Transform(circle, square))
        self.wait(1)
"""

if __name__ == "__main__":
    print("Rendering and uploading a test animation...")
    result = save_and_render(TEST_CODE, uid=TEST_UID, prompt="smoke test")

    if result.success:
        print(f"Success in {result.duration_ms}ms -> {result.video_url}")
    else:
        print(f"Failed: {result.error}")
