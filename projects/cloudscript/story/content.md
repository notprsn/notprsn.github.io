# Not One-Shottable, Yet

Around December, I came across a [Pinterest post](https://uk.pinterest.com/pin/1055599908592412/). Creative work in code had gotten much easier, and I've always thought clouds were cool, so I figured I could make a simple app out of it.

Turns out, simple was not the word.

The first problem was getting consistent cloud shapes. To do that, I ended up vibe-coding a makeshift engineering drawing framework that works in browser, mostly so I could sketch Cubic-Bezier curves directly into SVG format. TIL the representation for curved lines in SVG are cubic polynomials. I had a few ideas about symmetry and the golden ratio, and rolled from there.

The same framework became the tool for drawing number drops and punctuation marks too. Any time I could not draw something with the tools I had, I built the next little hacky tool into the drawing setup. Who needs Auto CAD when you have vibe-code?

Then I needed circle math to align the cloud letters along a floofy arc. It worked, but it looked too rigid, which, given the perfectionist that I am, was unacceptable. So I started scaling the letter shapes up and down in harmonic ratios from different musical scales. Theoretically, you can play the clouds as a piece and it should not sound too bad. It is in scale.

After that came the interiors. Shading the clouds was annoying because there is no direct fill option when a single cloud is really a collection of many small curves. This took way longer than expected, but I painstakingly landed on an elegant solution. Worth it? I guess?

Then I had to tune spacing and alignment across different aspect ratios. Static clouds are not fun for anyone, so motion became the next problem. I worked through linear transforms and implemented a lemniscate of Bernoulli path. The fact that you can now vibe-code elegant math like that gave me tech psychosis for the day. Welcome to our industrial revolution.

Finally, I had to make the app make sense on desktop and mobile viewports. I think I did a decent job, but I cannot say for sure. I'm not a designer. Also, design is subjective and imprecise, so if you're going to yuck on my yum, back it up with fact. I'm willing to learn.

All in all, if you thought I uploaded that Pinterest image to an agent and said, "Make me a cool web app to write messages in clouds," this should clarify the situation.

Maybe we reach that point someday. Maybe that day is a couple of months away. I'm prepared for anything at this point.

*fin*
