import { Github, Package, PlayCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 border-b border-zinc-200 bg-white z-50">
      <div className="max-w-full px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span
            className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-transparent group-hover:from-zinc-700 group-hover:via-zinc-600 group-hover:to-zinc-500 transition-all"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            Stellar x402
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/demo">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-700 hover:text-zinc-900"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Demo
            </Button>
          </Link>
          <Link to="/docs">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-700 hover:text-zinc-900"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Docs
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-700 hover:text-zinc-900"
            onClick={() =>
              window.open(
                "https://github.com/devesh1011/stellar-x402",
                "_blank",
              )
            }
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-700 hover:text-zinc-900"
            onClick={() =>
              window.open(
                "https://www.npmjs.com/package/stellar-x402",
                "_blank",
              )
            }
          >
            <Package className="w-4 h-4 mr-2" />
            NPM
          </Button>
        </div>
      </div>
    </div>
  );
}
