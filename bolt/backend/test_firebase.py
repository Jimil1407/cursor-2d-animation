from manim_engine import save_and_render

# Test Manim code
test_code = """
from manim import *

class MorphScene(Scene):
    def construct(self):
        # Create a circle
        circle = Circle()
        self.play(Create(circle))
        self.wait(1)
        
        # Transform it into a square
        square = Square()
        self.play(Transform(circle, square))
        self.wait(1)
"""

if __name__ == "__main__":
    print("Testing Firebase integration...")
    print("Rendering and uploading test animation...")
    
    # Call save_and_render with test code
    result = save_and_render(test_code)
    
    if result:
        print("✅ Success! Video URL:", result)
    else:
        print("❌ Failed to render and upload video") 