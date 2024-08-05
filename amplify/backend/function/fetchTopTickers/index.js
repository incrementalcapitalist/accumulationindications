const { Groq } = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.handler = async (event) => {
  try {
    const { symbol } = JSON.parse(event.body);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "provide a comma separated list of the top ten most active tickers in the same industry as the ticker provided and their corresponding exchanges.\n\nprovide only the comma-separated list.\n\nuse the exchange symbol only. \n\nthe exchange symbol must be compatible with TradingView.\n\nmake sure that each pair is enclosed in quotes and there is no space between the exchange, the colon, and the ticker.\n\nfor example, \"NASDAQ:DDOG\",\"NASDDAQ:GERN\", ..."
        },
        {
          role: "user",
          content: symbol
        }
      ],
      model: "llama3-8b-8192",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from Groq');
    }

    const tickers = content.split(',').map(ticker => ticker.trim());
    if (!tickers.includes(`NASDAQ:${symbol}`)) {
      tickers.unshift(`NASDAQ:${symbol}`);
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ tickers }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ error: 'Failed to fetch top tickers' }),
    };
  }
};