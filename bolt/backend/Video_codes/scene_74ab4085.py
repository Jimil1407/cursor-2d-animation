from manim import *

class HexagonScene(Scene):
    def construct(self):
        hexagon = RegularPolygon(n=6, start_angle=PI/2)
        self.play(Create(hexagon), run_time=2)
        self.wait(3)
        self.play(hexagon.animate.scale(0.5).shift(LEFT * 2), run_time=2)
        self.wait(3)