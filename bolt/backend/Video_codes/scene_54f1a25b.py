from manim import *

class CircleAnimation(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        self.play(Create(circle), run_time=2)
        self.wait(3)
        self.play(FadeOut(circle), run_time=2)
        self.wait(1)