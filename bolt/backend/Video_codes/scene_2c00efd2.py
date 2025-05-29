from manim import *

class CreateSquare(Scene):
    def construct(self):
        square = Square(side_length=3)
        self.play(Create(square), run_time=2)
        self.wait(3)
        self.play(FadeOut(square), run_time=2)
        self.wait(1)