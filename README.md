# Product Recommendation Bot

The Product Recommendation Bot (PRB) is a web application designed to provide personalized product recommendations. Leveraging the power of the OpenAI API, PRB analyzes a vast dataset of product listings to identify the most value-driven options for consumers, factoring in details such as price, shipping, ratings, and more.

## Features

- **Personalized Recommendations**: Offers tailored product suggestions based on user preferences and specified criteria.
- **Comprehensive Analysis**: Utilizes AI to analyze product listings, evaluating factors like cost, ratings, and shipping.
- **User-friendly Interface**: Simple and intuitive UI, making product searches and understanding results straightforward for all users.

## Technologies Used

- React 18.2.0
- OpenAI API 4.28.4
- Tailwind CSS 3.4.1 + DaisyUI 4.7.2 for styling
- Vite 5.1.4 for efficient project bundling
- TypeScript 5.2.2 for type-safe codebase
- ESLint and TypeScript ESLint for code quality
- Lottie React 2.4.0 for engaging animations

### Prerequisites

- Ensure you have Node.js (version 14 or later) installed on your machine.
- An API key from [OpenAI](https://openai.com/product) is required to fetch product recommendations.
- An API key from [Price API](https://app.priceapi.com/users/sign_up) is required to fetch products lists

## Getting Started

To get the PRB running locally, follow these steps:
1. Clone the repository:
```bash
git clone [https://github.com/LanceGundersen/PRB](https://github.com/LanceGundersen/PRB)
cd product-recommendation-bot
npm install
```
2. Add API keys to .env file
3. Run project
```bash
npm run dev
```
3. Visit the local host page
[PRB](http://localhost:5173/)