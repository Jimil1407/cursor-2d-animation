from manim import *

class CircleInHexagon(Scene):
    def construct(self):
        hexagon = RegularPolygon(n=6, start_angle=PI/6, color=BLUE, stroke_width=3)
        circle = Circle(radius=0.5, color=RED, fill_opacity=0.5).move_to(hexagon.get_center())

        self.play(Create(hexagon), run_time=2)
        self.wait(0.5)
        self.play(FadeIn(circle), run_time=1.5)
        self.wait(1)

        self.play(circle.animate.shift(UP * 0.7), run_time=1.5)
        self.wait(0.5)
        self.play(circle.animate.shift(DOWN * 0.7), run_time=1.5)

        self.wait(1)
        self.play(FadeOut(circle), FadeOut(hexagon), run_time=2)
        self.wait(0.5)