from manim import *

class CircleToSquare(Scene):
    def construct(self):
        # Create a circle
        circle = Circle(radius=2, color=BLUE)
        circle_label = Tex("Circle").next_to(circle, UP)

        # Create a square
        square = Square(side_length=4, color=GREEN) # Side length matches circle diameter for better morph
        square_label = Tex("Square").next_to(square, UP)
        square.move_to(circle.get_center()) # Centered to the circle

        # Initial display
        self.play(Create(circle), Write(circle_label))
        self.wait(1)

        # Transform circle into square
        self.play(Transform(circle, square), FadeTransform(circle_label, square_label))
        self.wait(2)

        self.play(FadeOut(square), FadeOut(square_label))
        self.wait(1)