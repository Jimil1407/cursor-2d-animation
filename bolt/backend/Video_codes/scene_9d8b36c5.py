from manim import *

class RayLineSegment(Scene):
    def construct(self):
        ray = Ray(start=LEFT, direction=RIGHT)
        line = Line(start=LEFT, end=RIGHT)
        line_segment = Line(start=LEFT, end=ORIGIN)

        self.play(Create(ray), run_time=2)
        self.wait(1)
        self.play(Create(line), run_time=2)
        self.wait(1)
        self.play(Create(line_segment), run_time=2)
        self.wait(1)
        self.play(FadeOut(ray), FadeOut(line), FadeOut(line_segment), run_time=1)
        self.wait(1)