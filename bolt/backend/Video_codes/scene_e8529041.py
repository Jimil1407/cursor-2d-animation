
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
