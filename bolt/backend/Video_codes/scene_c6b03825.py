from manim import *

class CreateCircle(Scene):
    def construct(self):
        circle = Circle()
        self.play(Create(circle), run_time=3)
        self.wait(3)
        self.play(FadeOut(circle), run_time=2)
        self.wait(2)