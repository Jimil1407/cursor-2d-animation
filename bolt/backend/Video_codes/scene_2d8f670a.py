from manim import *

class HexagonAnimation(Scene):
    def construct(self):
        hexagon = RegularPolygon(n=6, start_angle=PI/6)
        self.play(Create(hexagon), run_time=2)
        self.wait(3)
        self.play(hexagon.animate.rotate(PI/2), run_time=2)
        self.wait(3)