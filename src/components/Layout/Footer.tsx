"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Radio, Code, Github, Heart } from "lucide-react";

const Footer: React.FC = () => {
  const t = useTranslations();

  return (
    <footer className="bg-card py-4 mt-5 border-t">
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center md:text-left mb-2 md:mb-0">
            <p className="text-sm mb-1 text-muted-foreground">
              <Radio className="inline w-4 h-4 mr-2" />
              {t("common.footer.beforeTA1TLA")}
              <a
                href="https://www.qrz.com/db/TA1TLA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground no-underline hover:text-foreground transition-colors"
              >
                TA1TLA
              </a>
              {t("common.footer.afterTA1TLA")}
            </p>
            <p className="text-sm mb-0 text-muted-foreground">
              <Code className="inline w-4 h-4 mr-2" />
              {t("common.footer.beforeTA1VAL")}
              <a
                href="https://www.qrz.com/db/TA1VAL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground no-underline hover:text-foreground transition-colors"
              >
                TA1VAL
              </a>
              {t("common.footer.afterTA1VAL")}
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm mb-1 text-muted-foreground">
              <a
                href="https://github.com/talhaakkaya/ta-qso-logger"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground no-underline hover:text-foreground transition-colors"
              >
                <Github className="inline w-4 h-4 mr-2" />
                GitHub
              </a>
            </p>
            <p className="text-sm mb-0 text-muted-foreground">
              <Heart className="inline w-4 h-4 mr-1 text-red-500 fill-red-500" />
              Open Source - GPL-3.0
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 mt-3">
          <div className="text-center">
            <p className="text-sm mb-0 text-muted-foreground" style={{ fontSize: '0.85rem' }}>
              {t("common.footer.sign73")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
