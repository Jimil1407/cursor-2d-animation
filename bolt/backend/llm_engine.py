import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def generate_manim_code(prompt: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    
    headers = {
        "Content-Type": "application/json"
    }

    # Broader system prompt for diverse 2D animation
    system_prompt = (
        "You are a Python expert specialized in using the Manim Community Edition to create 2D animations. "
        "Given a user's description of a 2D animation, return a complete, well-paced Scene class. "
        "You can use any Manim objects like shapes, text, formulas, number lines, graphs, etc. "
        "Ensure clarity, pacing (~6–10 seconds), and appropriate use of animations like Create, Transform, Write, FadeIn, etc."
        "generate only the Python code needed to create the animation using Manim. "
        "Do not include explanations, comments, markdown formatting, or any extra text. "
        "Return only the valid code."

    )

    enriched_prompt = (
        f"{prompt}\n\nMake sure the animation is visually clear, expressive, and timed well."
    )

    full_prompt = system_prompt + "\n\n" + enriched_prompt

    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": full_prompt
                    }
                ]
            }
        ]
    }
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    res_json = response.json()

    # Debug print if needed
    print("Full response JSON:", res_json)

    try:
        generated_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        raise ValueError("Failed to parse Gemini response.") from e

    # Strip code fences
    if generated_text.startswith("```python"):
        generated_text = generated_text.removeprefix("```python").strip()
    elif generated_text.startswith("```"):
        generated_text = generated_text.removeprefix("```").strip()

    if generated_text.endswith("```"):
        generated_text = generated_text[:-3].strip()

    # Optional: Validate that it contains a Scene class
    if "class" not in generated_text or "Scene" not in generated_text:
        raise ValueError("The response does not contain a valid Manim Scene class.")

    print("Generated Manim code:\n", generated_text)
    return generated_text
