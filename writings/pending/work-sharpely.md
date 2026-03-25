# Sharpely (Neam Caps Pvt. Ltd.)

Sep '23 - Nov '23

Software Engineering Intern

## Website copy

- Re-engineered the firm's stock screener engine from Pandas to Polars (Rust backend), refactoring thousands of lines of code to achieve nearly 20x lower latency for user-facing computations.
- Integrated dx-charts, a high-performance open-source charting library, replacing paid TradingView components and eliminating licensing costs while enabling deeper API-level visualization control.
- Built automated exchange data pipelines for bulk/block deals, insider trades, and corporate actions directly from NSE endpoints, ensuring seamless integration with the production db servers.
- Prototyped LLM-based modules using LangChain and Hugging Face models to summarize financial PDFs, and integrated the Lean backtester as a potential front-facing framework.

## Long write-up

I joined Sharpely in September 2023. I'd spent a 2 month dissociative depression period, applying to jobs, professors, giving GRE and travelling in India with my family after not getting a permanent offer at Optiver. Noone was hiring and the LinkedIn algorithm, seeing my desperation, knew that I'd bite.

They were a small team of 5 people. A CEO, CTO, frontend engineer, backend engineer and wealthy fat guy urf money guy. The hiring project was to build a backtester and run a simple bollinger band crossover strategy on it with visuals. Fun project. 

My first assignment as intern was to improve performance of a stock screener by changing all existing pandas logic to polars. Polars is awesome. It's so much faster it's not even funny. The syntax is a nightmare though. I'd painfully isolate logical blocks in pandas, write them in polars and test the input and output dataframes. ChatGPT still sucked at ingesting documentation and giving syntax so I had to do it the old-fashioned way. 

Next I was tasked with integrating dx-charts, an open source charting library to replace their paid TradingView components. The funny part about this was their front-end engineer thought this was a dead-end because dx-charts had terrible documentation and he'd tried already and given up. I wasn't aware of this when I started and managed to get it in place. It was a breath of fresh air when the guy admitted after, that he hadn't been able to what I'd done. 

I also got to work on building data pipelines for bulk/block deals, insider trades and corporate actions directly from NSE/BSE endpoints. I'd get the data, clean it up, make it consistent with the existing database schema and push it to the production servers. I'd write one pipeline a day, test it, push it. 

The last point is basically a gimmick, I didn't do anything that created value. I pushed a bunch of PDFs through some HuggingFace models and got out unuseable garbage. I also tried to integrate the Lean backtester as a potential front-facing framework but that didn't go anywhere. There was some C# and dotnet code that I have no idea how to work with and I think I ended up forking the repository, setting up a backtest for buy at end of day sell at market open on the components of S&P 500. I'm drawing a blank even thinking about it.

Because this wasn't much effort I kept busy by simultaneously working on a Proof-of-Concept for a startup idea (CarSeekho) with Vineet. Standardising Driving Schools in India starting with Mumbai. Applied to E-Cell at IITB too. They chucked our idea at the idea stage. I also did a 6000 piece jigsaw puzzle in this window. 