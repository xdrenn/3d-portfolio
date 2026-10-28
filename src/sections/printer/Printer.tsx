import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { buildReceipt, pickArt } from "@/content/receipt";
import { useClickSound } from "@/hooks/useClickSound";
import { useOnFirstView } from "@/hooks/useOnFirstView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ELEMENT_IDS } from "@/lib/elementIds";
import { downloadReceiptImage } from "./receiptImage";
import "./printer.css";

/** One print. A new object feeds a new sheet out of the slot; `art` is its random picture. */
type PrintJob = { number: number; art: number };

type PrinterState = "printing" | "printed" | "torn";

const MS_PER_LINE = 80;
const TICK_EVERY_LINES = 2;
const TICK_FREQUENCY = 2600;
const KEY_FREQUENCY = 1400;
const PRINT_VISIBLE_RATIO = 0.5;

/**
 * The computer's printer, in the About section, level with the text. On first view it prints a small slip
 * with a few facts about me; the paper comes out of the slot at the bottom and hangs over whatever is below.
 * Every press of print feeds a new one with a different picture on top, one of them rare.
 * The visitor can tear it off and keep it as a PNG.
 */
export function Printer() {
  const reducedMotion = usePrefersReducedMotion();
  const playClick = useClickSound();
  // Invisible zone covering the body and the area the slip hangs over:
  // the print starts when that zone is mostly on screen, so the visitor sees the paper come out.
  const reachRef = useRef<HTMLDivElement>(null);

  const [job, setJob] = useState<PrintJob | null>(null);
  const [state, setState] = useState<PrinterState>("printing");
  const [isKeyDown, setIsKeyDown] = useState(false);

  const receipt = useMemo(() => (job ? buildReceipt(job.art, new Date()) : null), [job]);
  const lineCount = receipt?.lines.length ?? 0;
  const printDuration = lineCount * MS_PER_LINE;

  useOnFirstView(reachRef, PRINT_VISIBLE_RATIO, () =>
    setJob((current) => current ?? { number: 1, art: pickArt() }),
  );

  // Every new job feeds a new sheet, with the print head ticking along.
  useEffect(() => {
    if (!job) return;
    if (reducedMotion) {
      setState("printed");
      return;
    }

    setState("printing");
    let line = 0;
    const tickTimer = window.setInterval(() => {
      line += TICK_EVERY_LINES;
      playClick(TICK_FREQUENCY + (line % 4) * 120);
      if (line >= lineCount) clearInterval(tickTimer);
    }, MS_PER_LINE * TICK_EVERY_LINES);
    const doneTimer = window.setTimeout(() => setState("printed"), printDuration);

    return () => {
      clearInterval(tickTimer);
      clearTimeout(doneTimer);
    };
    // Only a new job restarts the print.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  const isPrinting = job !== null && state === "printing";

  const print = () => {
    if (isPrinting) return;
    playClick(KEY_FREQUENCY);
    setState("printing");
    setJob((current) => ({ number: (current?.number ?? 0) + 1, art: pickArt(current?.art) }));
  };

  const tearOff = () => {
    if (!job || !receipt) return;
    setState("torn");
  };

  return (
    <div id={ELEMENT_IDS.printer} className="printer">
      <div className="printer__reach" ref={reachRef} aria-hidden="true" />

      {/* Above the body, out of the flow, a small gap from it: the body keeps its place level with the text. */}
      <div className="printer__body">
        <div className="printer__panel">
          <span className={`printer__led${isPrinting ? " is-busy" : ""}`} aria-hidden="true" />
          <span className="printer__well">
            <button
              type="button"
              className={`printer__key${isKeyDown ? " is-pressed" : ""}`}
              onClick={print}
              onPointerDown={() => setIsKeyDown(true)}
              onPointerUp={() => setIsKeyDown(false)}
              onPointerLeave={() => setIsKeyDown(false)}
              disabled={isPrinting}
              aria-label="Print a slip"
            >
              <span>print</span>
            </button>
          </span>
        </div>
        <div className="printer__slot" aria-hidden="true" />
      </div>

      {/* Out of the flow: the slip hangs below the slot over whatever is there and never changes the page height. */}
      <div className="printer__paper-window">
        {job && receipt && (
          <div
            key={job.number}
            className={`receipt is-${state}`}
            onClick={state === "printed" ? tearOff : undefined}
            style={{ "--print-duration": `${printDuration}ms`, "--print-steps": lineCount } as CSSProperties}
          >
            <div className="receipt__perf" aria-hidden="true" />
            <pre className="receipt__text">{receipt.lines.join("\n")}</pre>
          </div>
        )}

      </div>
    </div>
  );
}
