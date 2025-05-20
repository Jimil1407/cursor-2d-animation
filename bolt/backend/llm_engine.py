# backend/llm_engine.py
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_manim_code(prompt: str) -> str:
    system_prompt = (
        "You are a Python Manim expert. Given a description, "
        "generate valid Manim Community Edition code to create the animation. "
        "Ensure it is a complete Scene class."
    )

    response = openai.ChatCompletion.create(
        model="gpt-4",  # or gpt-3.5-turbo
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5
    )

    return response.choices[0].message.content

