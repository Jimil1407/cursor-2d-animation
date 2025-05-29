from manim import *

class CreateTriangle(Scene):
    def construct(self):
        triangle = Triangle()
        self.play(Create(triangle), run_time=2)
        self.wait(2)
        self.play(triangle.animate.shift(LEFT * 2), run_time=2)
        self.wait(2)
        self.play(FadeOut(triangle), run_time=2)
        self.wait(1)