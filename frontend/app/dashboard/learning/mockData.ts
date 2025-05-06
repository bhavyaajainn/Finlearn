
export type ArticleCategory = 'Crypto' | 'Stocks' | 'Real Estate' | 'Personal Finance' | 'Investing';
export type ArticleLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: ArticleCategory;
  level: ArticleLevel;
  readTime: number; 
  date: string;
  isBookmarked: boolean;
  isRead: boolean;
  content: ArticleContent;
  relatedConcepts: Concept[];
}

export interface ArticleContent {
  introduction: string;
  background: string;
  application: string;
}

export interface Concept {
  id: string;
  term: string;
  definition: string;
  category: ArticleCategory;
}

export interface DailySummary {
  date: string;
  articlesRead: string[];
  conceptsLearned: string[];
  quiz: Quiz;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}


export const concepts: Concept[] = [
  {
    id: 'concept-1',
    term: 'Blockchain',
    definition: 'A decentralized, distributed ledger technology that records transactions across multiple computers.',
    category: 'Crypto',
  },
  {
    id: 'concept-2',
    term: 'Smart Contract',
    definition: 'Self-executing contracts with the terms directly written into code that automatically execute when predetermined conditions are met.',
    category: 'Crypto',
  },
  {
    id: 'concept-3',
    term: 'P/E Ratio',
    definition: 'Price-to-Earnings Ratio is a valuation metric that compares a company\'s current share price to its earnings per share.',
    category: 'Stocks',
  },
  {
    id: 'concept-4',
    term: 'Market Capitalization',
    definition: 'The total value of a company\'s outstanding shares, calculated by multiplying the share price by the number of outstanding shares.',
    category: 'Stocks',
  },
  {
    id: 'concept-5',
    term: 'Mortgage-Backed Securities',
    definition: 'Investment products that represent ownership in a pool of mortgage loans, allowing investors to earn income from mortgage payments.',
    category: 'Real Estate',
  },
  {
    id: 'concept-6',
    term: 'Dollar-Cost Averaging',
    definition: 'An investment strategy where a fixed amount is regularly invested regardless of asset price, reducing the impact of volatility.',
    category: 'Investing',
  },
  {
    id: 'concept-7',
    term: 'Emergency Fund',
    definition: 'Money set aside for unexpected expenses or financial hardships, typically covering 3-6 months of living expenses.',
    category: 'Personal Finance',
  },
];


export const articles: Article[] = [
  {
    id: 'article-1',
    title: 'Understanding Blockchain: The Foundation of Cryptocurrency',
    summary: 'Explore how blockchain technology works and why it has become the backbone of the cryptocurrency revolution.',
    category: 'Crypto',
    level: 'Beginner',
    readTime: 5,
    date: '2025-04-30',
    isBookmarked: false,
    isRead: false,
    content: {
      introduction: 'Blockchain technology is a revolutionary method of recording and validating transactions that underlies most cryptocurrencies. At its core, a blockchain is a distributed ledger maintained by a network of computers rather than a central authority.',
      background: 'The concept of blockchain was first introduced in 2008 by an individual or group using the pseudonym Satoshi Nakamoto, in a whitepaper describing Bitcoin. The technology was designed to eliminate the need for trusted third parties in financial transactions by creating a system where transaction records are transparent, immutable, and distributed across a network.',
      application: 'Today, blockchain technology extends far beyond cryptocurrencies. Major companies are implementing blockchain solutions for supply chain management, identity verification, and secure data sharing. The recent surge in institutional adoption of blockchain has led to increased mainstream acceptance and integration with traditional financial systems.'
    },
    relatedConcepts: [concepts[0], concepts[1]]
  },
  {
    id: 'article-2',
    title: 'How to Read Stock Market Indicators Like a Pro',
    summary: 'Learn the essential metrics and indicators that professional investors use to evaluate stocks and make informed decisions.',
    category: 'Stocks',
    level: 'Intermediate',
    readTime: 7,
    date: '2025-05-01',
    isBookmarked: true,
    isRead: false,
    content: {
      introduction: 'Stock market indicators are tools that investors use to evaluate market trends, company performance, and potential investment opportunities. Understanding these indicators can help you make more informed investment decisions and potentially improve your returns.',
      background: 'Technical analysis of stocks dates back to the late 1800s with the work of Charles Dow, who established the foundation for modern technical analysis. Over time, various indicators and metrics have been developed to help investors analyze market trends and company fundamentals.',
      application: 'Recent market volatility has highlighted the importance of understanding key indicators like P/E ratios, moving averages, and market breadth. As algorithmic trading becomes more prevalent, individual investors who can interpret these signals gain an advantage in navigating complex market conditions.'
    },
    relatedConcepts: [concepts[2], concepts[3]]
  },
  {
    id: 'article-3',
    title: 'Real Estate Investment Trusts: Passive Income Through Property',
    summary: 'Discover how REITs allow everyday investors to access real estate markets without directly owning property.',
    category: 'Real Estate',
    level: 'Beginner',
    readTime: 6,
    date: '2025-05-02',
    isBookmarked: false,
    isRead: true,
    content: {
      introduction: 'Real Estate Investment Trusts (REITs) are companies that own, operate, or finance income-producing real estate across various property sectors. They allow individual investors to earn dividends from real estate investments without having to buy, manage, or finance properties themselves.',
      background: 'REITs were established in the United States in 1960 when Congress passed legislation to enable small investors to participate in large-scale commercial real estate ownership. Since then, the REIT model has been adopted globally, with over 40 countries now having REIT regimes.',
      application: 'In the current high-interest rate environment, certain REIT sectors like data centers and industrial properties have shown resilience, while others face challenges. The post-pandemic shift in work patterns continues to impact office REITs, while residential and storage REITs benefit from changing lifestyle preferences.'
    },
    relatedConcepts: [concepts[4]]
  },
  {
    id: 'article-4',
    title: 'Building a Robust Emergency Fund: Your Financial Safety Net',
    summary: 'Learn why an emergency fund is crucial for financial stability and strategies to build one efficiently.',
    category: 'Personal Finance',
    level: 'Beginner',
    readTime: 4,
    date: '2025-05-03',
    isBookmarked: true,
    isRead: false,
    content: {
      introduction: 'An emergency fund is a financial safety net designed to cover unexpected expenses or income disruptions. Having easily accessible funds set aside specifically for emergencies can prevent the need to take on debt when unforeseen circumstances arise.',
      background: 'The concept of emergency savings has been a cornerstone of personal finance advice for decades, but its importance was highlighted during the 2008 financial crisis and again during the COVID-19 pandemic, when many households faced sudden income reductions.',
      application: 'With inflation affecting household budgets, the traditional recommendation of 3-6 months of expenses may need adjustment. High-yield savings accounts and money market funds are currently offering the best combination of liquidity and returns for emergency funds in the current interest rate environment.'
    },
    relatedConcepts: [concepts[6]]
  },
  {
    id: 'article-5',
    title: 'Dollar-Cost Averaging: A Strategy for Volatile Markets',
    summary: 'Explore how this simple investment approach can reduce risk and potentially increase returns over time.',
    category: 'Investing',
    level: 'Intermediate',
    readTime: 5,
    date: '2025-05-04',
    isBookmarked: false,
    isRead: false,
    content: {
      introduction: 'Dollar-cost averaging (DCA) is an investment strategy where you invest a fixed amount of money at regular intervals, regardless of market conditions. This approach can help mitigate the impact of market volatility and reduce the risk of making poor timing decisions.',
      background: 'The strategy has been advocated by investment legends like Benjamin Graham and Warren Buffett, who recognized that even professional investors cannot consistently time market tops and bottoms. By spreading investments over time, investors can avoid the psychological pitfalls of market timing.',
      application: 'Recent studies comparing lump-sum investing versus dollar-cost averaging during market downturns show that DCA can be particularly effective during periods of high volatility. Many investment platforms now offer automated DCA features, making it easier than ever to implement this strategy across various asset classes.'
    },
    relatedConcepts: [concepts[5]]
  }
];


export const dailySummary: DailySummary = {
  date: '2025-05-05',
  articlesRead: ['Real Estate Investment Trusts: Passive Income Through Property'],
  conceptsLearned: ['Mortgage-Backed Securities'],
  quiz: {
    id: 'quiz-1',
    questions: [
      {
        id: 'q1',
        question: 'What is the primary benefit of investing in REITs?',
        options: [
          'Tax-free gains on all investments',
          'Access to real estate returns without directly owning property',
          'Guaranteed returns regardless of market conditions',
          'Government insurance on all investments'
        ],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        question: 'What are Mortgage-Backed Securities?',
        options: [
          'Government loans for first-time homebuyers',
          'Insurance policies that protect mortgage lenders',
          'Investment products backed by a pool of mortgage loans',
          'Credit scores used by mortgage lenders'
        ],
        correctAnswerIndex: 2
      },
      {
        id: 'q3',
        question: 'Which REIT sectors have shown resilience in the current high-interest rate environment?',
        options: [
          'Office and retail REITs',
          'Hotel and hospitality REITs',
          'Data centers and industrial properties',
          'All REIT sectors perform equally in high-interest environments'
        ],
        correctAnswerIndex: 2
      }
    ]
  }
};


export const userPreferences = {
  interests: ['Crypto', 'Stocks', 'Personal Finance'],
  level: 'Beginner'
};
