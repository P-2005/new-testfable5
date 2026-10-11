from manim import *
import numpy as np


class MemoryLoop(Scene):
    def construct(self):
        self.camera.background_color = "#101827"
        self.play(Write(Text("Phase-indexed torque memory", font_size=34).to_edge(UP)))
        axes = Axes(x_range=[0, 1, .25], y_range=[-1, 1, .5], x_length=8, y_length=3.5,
                    axis_config={"color": GREY_B}).shift(DOWN * .4)
        labels = VGroup(Text("gait phase s", font_size=20), Text("stored torque", font_size=20))
        labels[0].next_to(axes.x_axis, DOWN)
        labels[1].rotate(PI / 2).next_to(axes.y_axis, LEFT)
        mem = axes.plot(lambda x: .55 * np.sin(2 * PI * x) + .12 * np.sin(6 * PI * x), x_range=[0, 1], color=BLUE)
        trial = Text("trial k", font_size=28, color=YELLOW).to_corner(UL).shift(DOWN * .8)
        self.play(Create(axes), FadeIn(labels), Create(mem), Write(trial), run_time=2)
        self.play(Transform(trial, Text("trial k+1", font_size=28, color=YELLOW).to_corner(UL).shift(DOWN * .8)),
                  mem.animate.set_color(GREEN), run_time=2)
        self.wait(1)


class BaselineUpdate(Scene):
    def construct(self):
        self.camera.background_color = "#101827"
        self.play(Write(Text("Baseline: every trial updates memory", font_size=34).to_edge(UP)))
        eq = Text("tau[k+1](s) = tau[k](s) + alpha [Kp e[k] + Kd edot[k]]", font_size=27)
        eq.next_to(ORIGIN, UP)
        ebox = RoundedRectangle(width=2.5, height=1.0, color=RED).shift(LEFT * 4 + DOWN * .6)
        mbox = RoundedRectangle(width=2.5, height=1.0, color=BLUE).shift(RIGHT * 3 + DOWN * .6)
        et = Text("tracking error", font_size=24).move_to(ebox)
        mt = Text("torque memory", font_size=24).move_to(mbox)
        ar = Arrow(ebox.get_right(), mbox.get_left(), color=YELLOW, buff=.15)
        self.play(Write(eq), Create(ebox), Write(et), Create(mbox), Write(mt), GrowArrow(ar), run_time=3)
        self.play(Indicate(eq, color=YELLOW), run_time=1.5)
        self.wait(1)


class CorruptedTrial(Scene):
    def construct(self):
        self.camera.background_color = "#101827"
        self.play(Write(Text("Failure mode: a one-off disturbance contaminates memory", font_size=30).to_edge(UP)))
        axes = Axes(x_range=[0, 1, .25], y_range=[-1.2, 1.2, .6], x_length=8, y_length=3.4,
                    axis_config={"color": GREY_B}).shift(DOWN * .5)
        clean = axes.plot(lambda x: .5 * np.sin(2 * PI * x), x_range=[0, 1], color=BLUE)
        bad = axes.plot(lambda x: .5 * np.sin(2 * PI * x) + .55 * np.exp(-((x - .55) / .09) ** 2), x_range=[0, 1], color=RED)
        pulse = axes.plot(lambda x: .9 * np.exp(-((x - .55) / .08) ** 2), x_range=[0, 1], color=ORANGE)
        tag = Text("unexpected push / slip", font_size=24, color=RED).to_edge(DOWN)
        self.play(Create(axes), Create(clean), Write(Text("normal memory", font_size=22, color=BLUE).to_corner(UL).shift(DOWN * .8)), run_time=2)
        self.play(Create(pulse), Write(tag), run_time=2)
        self.play(Transform(clean, bad), run_time=2)
        self.play(Indicate(clean, color=RED), run_time=1)
        self.wait(1)


class GatedUpdate(Scene):
    def construct(self):
        self.camera.background_color = "#101827"
        self.play(Write(Text("Proposed fix: gate the memory update", font_size=34).to_edge(UP)))
        eq1 = Text("d[k] = disturbance score", font_size=31).shift(UP * 1.5)
        eq2 = Text("c[k,s] = contact consistency", font_size=31)
        eq3 = Text("q[k,s] = clip((1 - d[k]) c[k,s], 0, 1)", font_size=31).shift(DOWN * 1.5)
        eq4 = Text("tau[k+1] = tau[k] + alpha q[k] delta_tau[k]", font_size=31).shift(DOWN * 3)
        self.play(Write(eq1), Write(eq2), Write(eq3), Write(eq4), run_time=4)
        self.play(Indicate(eq3, color=GREEN), Indicate(eq4, color=GREEN), run_time=2)
        badge = Text("bad trial  ->  q near 0  ->  keep previous memory", font_size=25, color=GREEN).to_edge(DOWN)
        self.play(Write(badge), run_time=1)
        self.wait(1)


class Comparison(Scene):
    def construct(self):
        self.camera.background_color = "#101827"
        self.play(Write(Text("Testable research question", font_size=34).to_edge(UP)))
        left = VGroup(Text("Baseline PD-ILC", font_size=28, color=RED), Text("writes every trial", font_size=24),
                      Text("memory can drift after slip", font_size=22)).arrange(DOWN, buff=.2).shift(LEFT * 3)
        right = VGroup(Text("Disturbance-gated ILC", font_size=28, color=GREEN), Text("accepts trusted samples", font_size=24),
                       Text("quarantines corrupted trials", font_size=22)).arrange(DOWN, buff=.2).shift(RIGHT * 3)
        line = Line(UP * 2.5, DOWN * 2.5, color=GREY_B)
        claim = Text("Compare RMSE and memory contamination in simulation.", font_size=26, color=YELLOW).to_edge(DOWN)
        self.play(FadeIn(left), FadeIn(right), Create(line), Write(claim), run_time=3)
        self.play(Indicate(right, color=GREEN), run_time=1)
        self.wait(2)
