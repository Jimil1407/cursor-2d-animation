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
    
    system_prompt = (
        "You are a Python Manim expert. Given a description, "
        "generate valid Manim Community Edition code to create the animation. "
        "Ensure it is a complete Scene class."
    )
    
    full_prompt = system_prompt + "\n\n" + prompt

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

    print("Full response JSON:", res_json)

    candidate = res_json["candidates"][0]
    generated_text = candidate["content"]["parts"][0]["text"]

    # Now remove any markdown code fences, e.g. ```python ... ```
    if generated_text.startswith("```python"):
        generated_text = generated_text[len("```python"):].strip()
    elif generated_text.startswith("```"):
        generated_text = generated_text[len("```"):].strip()

    if generated_text.endswith("```"):
        generated_text = generated_text[:-3].strip()

    print("Generated Manim code:", generated_text)
    return generated_text
