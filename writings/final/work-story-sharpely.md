# Sharpely (Neam Caps Pvt. Ltd.)

I joined Sharpely in September 2023. I'd spent a two-month dissociative depression stretch applying to jobs, writing to professors, giving the GRE, and travelling around India with my family after not getting a permanent offer at Optiver. No one was hiring, and the LinkedIn algorithm, seeing my desperation, knew I'd bite.

They were a tiny team: a CEO, a CTO, a frontend engineer, a backend engineer, and the money guy. The hiring project was to build a backtester and run a simple Bollinger-band crossover strategy on it with visuals. Fun project.

My first assignment as an intern was to improve the performance of a stock screener by changing the existing Pandas logic to Polars. Polars is awesome. It is so much faster it isn't even funny. The syntax is a nightmare though. I would isolate logical blocks in Pandas, rewrite them in Polars, and then test the input and output DataFrames until they matched. ChatGPT still sucked at ingesting documentation and giving correct syntax back then, so I had to do it the old-fashioned way.

Next I was tasked with integrating dx-charts, an open-source charting library, to replace their paid TradingView components. The funny part was that their frontend engineer thought it was a dead end because dx-charts had terrible documentation and he had already tried and given up. I wasn't aware of that when I started, so I just kept going and eventually got it in place. It was a breath of fresh air when he admitted afterwards that he hadn't been able to do what I'd done.

I also worked on data pipelines for bulk deals, block deals, insider trades, and corporate actions directly from NSE and BSE endpoints. I would pull the data, clean it up, make it consistent with the existing database schema, and push it to the production servers. One pipeline a day, test it, ship it.

The last point on the resume is basically a gimmick. I didn't do anything that created real value there. I pushed a bunch of PDFs through some Hugging Face models and got unusable garbage back. I also tried to integrate the Lean backtester as a potential front-facing framework, but that didn't go anywhere. There was some C# and .NET code I had no idea how to work with, and I think I eventually ended up forking the repository and setting up a toy backtest for buying at end of day and selling at market open on S&P 500 components. I'm drawing a blank even thinking about it.

Because this role wasn't all-consuming, I kept myself busy by simultaneously working on a proof of concept for a startup idea, CarSeekho, with Vineet. Standardising driving schools in India, starting with Mumbai. I also applied to E-Cell at IITB. They killed the idea at the idea stage. I did a 6000-piece jigsaw puzzle in this window too.
