import { Link } from "react-router-dom";
import { Button } from "@heroui/react";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Dependency Injection&nbsp;</span>
          <span className={title({ color: "blue" })}>for React&nbsp;</span>
          <br />
          <span className={title()}>with NestJS-style modules</span>
          <div className={subtitle({ class: "mt-4" })}>
            Built with @abdokouta/react-di and HeroUI
          </div>
        </div>

        <div className="flex gap-3">
          <Button as={Link} color="primary" size="lg" to="/container">
            View Container Demo
          </Button>
          <Button
            as="a"
            href="https://github.com/pixielity-inc/react-di"
            rel="noopener noreferrer"
            size="lg"
            startContent={<GithubIcon size={20} />}
            target="_blank"
            variant="bordered"
          >
            GitHub
          </Button>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 rounded-xl bg-surface shadow-surface px-4 py-2">
            <pre className="text-sm font-medium font-mono">
              npm install{" "}
              <code className="px-2 py-1 h-fit font-mono font-normal inline whitespace-nowrap rounded-sm bg-accent/20 text-accent text-sm">
                @abdokouta/react-di reflect-metadata
              </code>
            </pre>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
