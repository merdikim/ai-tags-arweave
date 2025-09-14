# AI Tags Arweave

AI Tags Arweave is a project designed to leverage AI for generating metadata tags on [Arweave](https://www.arweave.org/). This enables decentralized, permanent, and searchable storage of tagged data.

## Features

- AI-powered tag generation for plain text and documents
- RESTful API for easy integration

## Getting Started

### Prerequisites

- Node.js >= 16.x
- Groq API KEY for LLM interaction

### Installation

```bash
git clone https://github.com/merdikim/ai-tags-arweave.git
cd ai-tags-arweave
npm install
```

### Configuration

Create a `.env` file with your credentials:

```env
GROQ_API_KEY=your_openai_api_key
```

### Usage

```bash
npm start
```

## API Endpoints

| Method | Endpoint         | Description                |
|--------|------------------|----------------------------|
| POST   | `/generate-tags` | Generate tags              |

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

## License

MIT License

## Acknowledgements

- [Arweave](https://www.arweave.org/)
- [Groq](https://groq.com/)
- Community contributors