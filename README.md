# 📈 Signalist — AI-Powered Stock Market App

![Signalist Banner](image_122477.jpg)

> **Signalist** is a high-performance, real-time financial platform designed to provide users with AI-driven insights and automated market tracking.

---

## 📋 Table of Contents

1. [✨ Introduction](#-introduction)
2. [⚙️ Tech Stack](#️-tech-stack)
3. [🔋 Features](#-features)
4. [🤸 Quick Start](#-quick-start)
5. [🔗 Assets](#-assets)
6. [🚀 More](#-more)

---

## ✨ Introduction

**Signalist** is an AI-powered modern stock market app built with **Next.js**, **Shadcn**, **Better Auth**, and **Inngest**. 

Track real-time prices, set personalized alerts, explore company insights, and manage watchlists effortlessly. The admin dashboard allows for managing stocks, publishing news, and monitoring user activity, while event-driven workflows power automated alerts, AI-driven daily digests, earnings notifications, and sentiment analysis. It’s a perfect setup for developers who want a dynamic, real-time financial platform.

---

## ⚙️ Tech Stack

* **[Better Auth](https://www.better-auth.com/)** is a framework-agnostic authentication and authorization library for TypeScript. It provides built-in support for email/password login, social sign-on (Google, GitHub, Apple, and more), and multi-factor authentication, simplifying user authentication and account management.
* **[CodeRabbit](https://coderabbit.ai/)** is an AI-powered code review assistant that integrates with GitHub. It helps developers catch bugs, enforce best practices, and maintain consistent code quality across pull requests, reducing manual review effort and speeding up the development workflow.
* **[Finnhub](https://finnhub.io/)** is a real-time financial data API that provides stock, forex, and cryptocurrency market data. It offers developers access to fundamental data, economic indicators, and news, making it useful for building trading apps, dashboards, and financial analysis tools.
* **[Inngest](https://www.inngest.com/)** is a platform for event-driven workflows and background jobs. It allows developers to build reliable, scalable automated processes such as real-time alerts, notifications, and AI-powered workflows.
* **[MongoDB](https://www.mongodb.com/)** is a flexible, high-performance NoSQL database. It stores data in JSON-like documents, supports dynamic schemas, and provides robust features for scalability, replication, and querying.
* **[Nodemailer](https://nodemailer.com/)** is a Node.js library for sending emails easily. It supports various transport methods such as SMTP, OAuth2, and third-party services, making it a reliable tool for handling transactional emails, notifications, and contact forms in applications.
* **[Next.js](https://nextjs.org/)** is a powerful React framework for building full-stack web applications. It provides server-side rendering, static site generation, and API routes, allowing developers to create optimized and scalable apps quickly.
* **[Shadcn](https://ui.shadcn.com/)** is an open-source library of fully customizable, accessible React components. It helps teams rapidly build consistent, visually appealing UIs while allowing full control over design and layout.
* **[TailwindCSS](https://tailwindcss.com/)** is a utility-first CSS framework that allows developers to build custom, responsive designs quickly without leaving their HTML. It provides pre-defined classes for layout, typography, colors, and more.
* **[TypeScript](https://www.typescriptlang.org/)** is a statically typed superset of JavaScript that improves code quality, tooling, and error detection. It is ideal for building large-scale applications and enhances maintainability.

---

## 🔋 Features

👉 **Stock Dashboard**: Track real-time stock prices with interactive line and candlestick charts, including historical data, and filter stocks by industry, performance, or market cap.

👉 **Powerful Search**: Quickly find the best stocks with an intelligent search system that helps you navigate through Signalist.

👉 **Watchlist & Alerts**: Create a personalized watchlist, set alert thresholds for price changes or volume spikes, and receive instant email notifications to stay on top of the market.

👉 **Company Insights**: Explore detailed financial data such as PE ratio, EPS, revenue, recent news, filings, analyst ratings, and sentiment scores for informed decision-making.

👉 **Real-Time Workflows**: Powered by **Inngest**, automate event-driven processes like price updates, alert scheduling, automated reporting, and AI-driven insights.

👉 **AI-Powered Alerts & Summaries**: Generate personalized market summaries, daily digests, and earnings report notifications, helping users track performance and make data-driven decisions.

👉 **Customizable Notifications**: Fine-tune alerts and notifications based on user watchlists and preferences for a highly personalized experience.

👉 **Analytics & Insights**: Gain insights into user behavior, stock trends, and engagement metrics, enabling smarter business and trading decisions.

And many more, including code architecture and reusability.

---

## 🤸 Quick Start

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed on your machine:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [npm](https://www.npmjs.com/) (Node Package Manager)

### Cloning the Repository

```bash
git clone [https://github.com/adrianhajdin/signalist_stock-tracker-app.git](https://github.com/Swarup0911/signalist_stock-tracker-app.git)
cd signalist_stock-tracker-app
```

# Project Setup Guide

## Installation
Install the project dependencies using npm:

```bash
npm install
```

### Set Up Environment Variables
Create a new file named `.env` in the root of your project and add the following content:

```env
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# FINNHUB
NEXT_PUBLIC_FINNHUB_API_KEY=
FINNHUB_BASE_URL=[https://finnhub.io/api/v1](https://finnhub.io/api/v1)

# MONGODB
MONGODB_URI=

# BETTER AUTH
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# GEMINI
GEMINI_API_KEY=

# NODEMAILER
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
```

Replace the placeholder values with your real credentials. You can get these by signing up at: [MongoDB](https://www.mongodb.com/), [Gemini](https://aistudio.google.com/), [Inngest](https://www.inngest.com/), and [Finnhub](https://finnhub.io/).

### Running the Project
Run the following commands in your terminal:

```bash
npm run dev
npx inngest-cli@latest dev
```
Open http://localhost:3000 in your browser to view the project.
