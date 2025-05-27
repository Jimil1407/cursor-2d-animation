from manim import *

class CreateCircle(Scene):
    def construct(self):
        # Create a circle
        circle = Circle(radius=2, color=BLUE)
        # Optionally, set fill opacity
        circle.set_fill(PINK, opacity=0.5)
        # Add the circle to the scene
        self.add(circle)
        # Show the circle on screen
        self.play(Create(circle))
        # Keep the circle visible for a short time
        self.wait(2)