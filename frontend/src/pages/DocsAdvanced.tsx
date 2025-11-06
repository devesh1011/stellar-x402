"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import {
  ChevronRight,
  Menu,
  X,
  BookOpen,
  Code2,
  Rocket,
  Zap,
  ArrowUp,
  Github,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import "highlight.js/styles/github-dark.css";

interface DocItem {
  title: string;
  path?: string;
  children?: DocItem[];
}

const docsStructure: DocItem[] = [
  { title: "Welcome to Stellar x402", path: "README.md" },
  {
    title: "Getting Started",
    children: [
      {
        title: "Quickstart for Sellers",
        path: "getting-started/quickstart-sellers.md",
      },
      {
        title: "Quickstart for Buyers",
        path: "getting-started/quickstart-buyers.md",
      },
    ],
  },
  {
    title: "Core Concepts",
    children: [
      { title: "HTTP 402 Protocol", path: "core-concepts/http-402.md" },
      { title: "Facilitator", path: "core-concepts/facilitator.md" },
      { title: "Client / Server", path: "core-concepts/client-server.md" },
    ],
  },
];

export default function DocsAdvanced() {
  const params = useParams();
  const navigate = useNavigate();
  const slug = params["*"] || "";

  const [content, setContent] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("README.md");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Getting Started", "Core Concepts"]),
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const allDocs = useMemo(() => {
    const docs: Array<{ title: string; path: string }> = [];
    docsStructure.forEach((item) => {
      if (item.path) docs.push({ title: item.title, path: item.path });
      if (item.children) {
        item.children.forEach((child) => {
          if (child.path) docs.push({ title: child.title, path: child.path });
        });
      }
    });
    return docs;
  }, []);

  useEffect(() => {
    const docPath = slug ? `${slug}.md` : "README.md";
    setSelectedDoc(docPath);

    fetch(`/docs/${docPath}`)
      .then((res) => {
        if (!res.ok) throw new Error("Doc not found");
        return res.text();
      })
      .then((text) => setContent(text))
      .catch((err) => {
        console.error("Error loading doc:", err);
        setContent(
          "# Document Not Found\n\nThe requested documentation could not be found.",
        );
      });
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToDoc = (docPath: string) => {
    const urlPath = docPath.replace(".md", "");
    navigate(`/docs/${urlPath}`);
    setIsMobileMenuOpen(false);
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  };

  const getSectionIcon = (title: string) => {
    switch (title) {
      case "Getting Started":
        return <Rocket className="w-4 h-4" />;
      case "Core Concepts":
        return <BookOpen className="w-4 h-4" />;
      case "API Reference":
        return <Code2 className="w-4 h-4" />;
      case "Guides":
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const renderSidebarItem = (
    item: DocItem,
    level = 0,
  ): React.ReactElement | null => {
    const isParent = !!item.children;
    const isLink = !!item.path;
    const isExpanded = expandedSections.has(item.title);

    if (isParent) {
      return (
        <div key={item.title} className="mb-2">
          <button
            onClick={() => toggleSection(item.title)}
            className={`w-full text-left px-3 py-2.5 hover:bg-zinc-50 transition-all duration-200 flex items-center justify-between rounded-lg group ${
              level > 0
                ? "text-sm ml-2"
                : "font-bold text-sm shadow-sm border border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {level === 0 && getSectionIcon(item.title)}
              <span
                className={
                  level === 0 ? "text-zinc-900" : "text-zinc-700 font-medium"
                }
              >
                {item.title}
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
          {isExpanded && item.children && (
            <div className="mt-1.5 space-y-0.5 pl-3 ml-2 border-l-2 border-zinc-200">
              {item.children.map((child) =>
                renderSidebarItem(child, level + 1),
              )}
            </div>
          )}
        </div>
      );
    }

    if (isLink) {
      const isSelected = selectedDoc === item.path;
      return (
        <button
          key={item.path}
          onClick={() => navigateToDoc(item.path!)}
          className={`w-full text-left px-3 py-2 mb-1 transition-all duration-200 text-sm rounded-lg ${
            isSelected
              ? "bg-zinc-900 text-white font-semibold shadow-md"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
          } ${level > 0 ? "ml-2" : ""}`}
        >
          {item.title}
        </button>
      );
    }

    return null;
  };

  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1
        className="text-4xl font-bold mb-8 mt-2 pb-4 text-zinc-900 border-b-2 border-zinc-900"
        {...props}
      />
    ),
    h2: ({ node, ...props }: any) => (
      <h2
        className="text-2xl font-bold mb-6 mt-12 pb-2 text-zinc-900 border-b border-zinc-200"
        {...props}
      />
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        className="text-xl font-semibold mb-4 mt-10 text-zinc-900"
        {...props}
      />
    ),
    h4: ({ node, ...props }: any) => (
      <h4
        className="text-lg font-semibold mb-3 mt-8 text-zinc-900"
        {...props}
      />
    ),
    p: ({ node, ...props }: any) => (
      <p className="mb-6 leading-relaxed text-zinc-800" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a
        className="text-blue-600 hover:underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-zinc-800" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol
        className="list-decimal pl-6 mb-6 space-y-2 text-zinc-800"
        {...props}
      />
    ),
    li: ({ node, ...props }: any) => (
      <li className="text-zinc-800 leading-relaxed" {...props} />
    ),
    code: ({ node, inline, ...props }: any) => {
      if (inline) {
        return (
          <code
            className="bg-zinc-100 text-pink-600 px-2 py-0.5 rounded text-sm font-mono border border-zinc-200"
            {...props}
          />
        );
      }
      return (
        <code className="bg-zinc-900 text-zinc-100 block p-4" {...props} />
      );
    },
    pre: ({ node, ...props }: any) => (
      <pre
        className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto my-6"
        {...props}
      />
    ),
    table: ({ node, ...props }: any) => (
      <table
        className="mb-6 border-collapse border border-zinc-300 w-full text-zinc-800"
        {...props}
      />
    ),
    th: ({ node, ...props }: any) => (
      <th
        className="border border-zinc-300 bg-zinc-100 px-4 py-2 text-left font-semibold"
        {...props}
      />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border border-zinc-300 px-4 py-2" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="border-l-4 border-zinc-300 pl-4 py-2 my-6 text-zinc-700 italic bg-zinc-50 rounded"
        {...props}
      />
    ),
  };

  const isWelcomePage = selectedDoc === "README.md";
  const currentIndex = allDocs.findIndex((doc) => doc.path === selectedDoc);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc =
    currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 flex flex-col pt-16">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        variant="outline"
        size="icon"
        className="fixed top-20 left-4 z-50 lg:hidden shadow-lg bg-white"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-72 border-r border-zinc-200 bg-white overflow-y-auto shadow-xl z-40 transition-transform duration-300 lg:translate-x-0 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="py-8 px-5">
            {docsStructure.map((item) => renderSidebarItem(item))}

            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-zinc-200">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3 px-3">
                External Links
              </h3>
              <div className="space-y-2">
                <a
                  href="https://github.com/devesh1011/stellar-x402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 hover:bg-zinc-50 rounded-lg"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
                <a
                  href="https://www.npmjs.com/package/stellar-x402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2 hover:bg-zinc-50 rounded-lg"
                >
                  <Code2 className="w-4 h-4" />
                  NPM Package
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 py-8 lg:ml-72 lg:px-16 lg:py-16">
          <article className="max-w-4xl mx-auto">
            {/* Hero for Welcome Page */}
            {isWelcomePage && (
              <div className="mb-16">
                <Card className="border-2 border-zinc-200 shadow-lg">
                  <CardContent className="p-8 lg:p-14">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-sm">
                        <Zap className="w-7 h-7 text-zinc-900" />
                      </div>
                      <span className="text-sm font-medium text-zinc-700 border border-zinc-300 px-3 py-1 rounded-full">
                        HTTP 402 Protocol
                      </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-5 text-zinc-900">
                      Welcome to Stellar x402
                    </h1>
                    <p className="text-lg text-zinc-600 mb-10 leading-relaxed max-w-2xl">
                      Stellar-native HTTP 402 implementation. Enable seamless
                      micropayments and pay-per-use APIs with built-in
                      blockchain verification on Stellar.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        onClick={() =>
                          navigateToDoc("getting-started/quickstart-sellers.md")
                        }
                        className="bg-zinc-900 text-white hover:bg-zinc-800"
                        size="lg"
                      >
                        <Rocket className="w-4 h-4 mr-2" />
                        Get Started
                      </Button>
                      <Button
                        onClick={() =>
                          navigateToDoc("core-concepts/http-402.md")
                        }
                        variant="outline"
                        size="lg"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Learn Concepts
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Feature Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-1 gap-6">
                  <Card
                    className="hover:shadow-lg transition-all cursor-pointer border-2 border-zinc-200"
                    onClick={() =>
                      navigateToDoc("getting-started/quickstart-sellers.md")
                    }
                  >
                    <CardContent className="p-7">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200">
                          <Rocket className="w-5 h-5 text-zinc-900" />
                        </div>
                        <h3 className="font-bold text-zinc-900 text-lg">
                          Quick Start
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-600">
                        Get up and running in minutes with our quickstart guides
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Document Content */}
            <div className="prose prose-zinc max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={markdownComponents}
              >
                {content}
              </ReactMarkdown>
            </div>

            {/* Navigation */}
            {(prevDoc || nextDoc) && (
              <div className="mt-16 pt-8 border-t border-zinc-200 flex justify-between gap-4">
                {prevDoc ? (
                  <Button
                    onClick={() => navigateToDoc(prevDoc.path)}
                    variant="outline"
                    className="flex-1"
                  >
                    ← {prevDoc.title}
                  </Button>
                ) : (
                  <div />
                )}
                {nextDoc && (
                  <Button
                    onClick={() => navigateToDoc(nextDoc.path)}
                    variant="outline"
                    className="flex-1"
                  >
                    {nextDoc.title} →
                  </Button>
                )}
              </div>
            )}
          </article>
        </main>
      </div>

      {/* Back to Top */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full shadow-lg"
          size="icon"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
