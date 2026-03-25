# Koch Snowflake Notes

Use this when implementing or extending the Coding Train Koch Snowflake sketch.

## Reference structure

- The original challenge starts from an equilateral triangle and replaces each segment with four child segments.
- The p5 source isolates the subdivision math inside a `Segment` class and applies one generation step per mouse press.
- The key operation is: split the segment into thirds, rotate the middle third by `-PI / 3`, and connect the four resulting segments in order.

## Safe extensions

- Keep the ordered segment list or point list intact so the snowflake remains drawable as one continuous polyline or polygon.
- Add controls for iteration count, seed polygon sides, radius, and peak angle before introducing more exotic deformation.
- Treat color, pulse, and slow rotation as render-only parameters so geometry is not rebuilt unnecessarily.
- When generalizing beyond the equilateral case, be explicit about the turn direction so spikes keep pointing outward.

## Relevant upstream snapshots

- Coding Train Koch Snowflake p5 sketch: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/P5/sketch.js, fetched 2026-03-25T21:04:24.834Z
- Coding Train Koch Snowflake p5 segment: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/P5/segment.js, fetched 2026-03-25T21:04:23.455Z
- Coding Train Koch Snowflake Processing sketch: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/Processing/CC_129_Koch_Snowflake/CC_129_Koch_Snowflake.pde, fetched 2026-03-25T21:04:25.688Z
- Coding Train Koch Snowflake Processing segment: https://raw.githubusercontent.com/CodingTrain/Coding-Challenges/main/129_Koch_Snowflake/Processing/CC_129_Koch_Snowflake/Segment.pde, fetched 2026-03-25T21:04:25.302Z
