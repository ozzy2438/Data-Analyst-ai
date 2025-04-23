# Data Analysis Platform

A modern, interactive data analysis platform built with React that allows users to upload, clean, analyze, and interact with data using AI.

## Features

- **Data Upload**: Upload CSV and Excel files for analysis
- **Data Visualization**: View your data in an interactive table
- **Data Cleaning**: Handle missing values, duplicate rows, and data type conversions
- **Exploratory Analysis**: Get automatic statistics and insights about your data
- **Data Visualization**: Generate charts and plots to visualize your data
- **AI-Powered Chat Interface**: Ask questions about your data in natural language and get responses with:
  - Text explanations
  - Data tables
  - Python code to reproduce the analysis

## Project Structure

```
src/
├── components/              # React components
│   ├── layout/              # Layout components (Header, Footer, etc.)
│   ├── cleaning/            # Data cleaning components
│   ├── analysis/            # Data analysis components
│   ├── visualization/       # Chart and visualization components
│   ├── FileUpload.tsx       # File upload interface
│   ├── DataTable.tsx        # Data display table
│   ├── DataCleaning.tsx     # Data cleaning interface
│   ├── ChatInterface.tsx    # AI chat interface
│   └── ...
│
├── context/                 # React context
│   └── DataContext.tsx      # Data management context
│
├── services/                # External services
│   └── openai.ts            # OpenAI API integration
│
├── utils/                   # Utility functions
│   ├── csvUtils.ts          # CSV file handling
│   ├── excelUtils.ts        # Excel file handling  
│   ├── cleaningUtils.ts     # Data cleaning utilities
│   └── statisticsUtils.ts   # Statistical analysis utilities
│
├── App.tsx                  # Main app component
└── main.tsx                 # Application entry point
```

## Technologies Used

- **React**: Frontend library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **OpenAI API**: AI integration for data analysis
- **Vite**: Build tool and development server

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/data-analysis-platform.git
cd data-analysis-platform
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Create a `.env` file in the root directory and add your OpenAI API key
```
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open `http://localhost:5173` in your browser

## Usage

1. **Upload Data**: Start by uploading a CSV or Excel file
2. **Explore Data**: View your data in the table view
3. **Clean Data**: Clean your data by handling missing values and duplicates
4. **Analyze Data**: Generate statistics and insights about your data
5. **Visualize Data**: Create charts to visualize your data
6. **Chat with AI**: Ask questions about your data in natural language

## License

MIT License

## Acknowledgements

- OpenAI for the GPT API
- The React team for the amazing framework
- All the open-source libraries that made this project possible 