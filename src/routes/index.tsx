import { createFileRoute, useRouter, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import {
  Shield, ShieldCheck, ShieldAlert, Loader2, Sparkles, Zap, Lock, Eye,
  FileSearch, Activity, Copy, RotateCcw, Share2, AlertTriangle, CheckCircle2,
  Link2, Clock, Mail, AtSign, FlaskConical, ChevronRight, FileDown, LogOut,
  Globe2, UserRound,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { analyzeEmail, analyzeSocialProfile, analyzeWebsite } from "@/lib/phishing.functions";
import type {
  PhishingAnalysis,
  SocialProfileAnalysis,
  WebsiteAnalysis,
} from "@/lib/phishing.schema";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "PhishGuard AI — Email, Profile & Website Threat Checks" },
      { name: "description", content: "Assess suspicious emails, social profiles, and websites with AI-assisted risk indicators and clear explanations." },
      { property: "og:title", content: "PhishGuard AI — Email, Profile & Website Threat Checks" },
      { property: "og:description", content: "Assess suspicious emails, social profiles, and websites with AI-assisted risk indicators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PhishGuardPage,
});

type HistoryItem = {
  id: string;
  subject: string;
  verdict: string;
  ts: number;
};

type ScanMode = "email" | "profile" | "website";
type ScanAnalysis = PhishingAnalysis | SocialProfileAnalysis | WebsiteAnalysis;

const SAMPLE_PHISHING = {
  subject: "URGENT: Your account will be suspended in 24 hours",
  sender: "security-alert@paypa1-support.com",
  body: `Dear Valued Customer,

We have detected unusual activity on your PayPal account. Your account will be PERMANENTLY SUSPENDED within 24 hours unless you verify your identity immediately.

Click here to verify now: http://paypa1-verify.security-check.tk/login

Please provide:
- Full name
- Social Security Number
- Credit card details
- Online banking password

Failure to act will result in permanent loss of funds.

Regards,
PayPal Security Team`,
};

const SAMPLE_SAFE = {
  subject: "Your October invoice is ready",
  sender: "billing@stripe.com",
  body: `Hi Alex,

Your invoice for October 2025 is now available in your Stripe Dashboard. The total of $42.00 was charged to your card ending in 4242.

You can view or download the invoice anytime from your billing history.

Thanks for using Stripe,
The Stripe Team`,
};

function PhishGuardPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeEmail);
  const analyzeProfile = useServerFn(analyzeSocialProfile);
  const analyzeSite = useServerFn(analyzeWebsite);
  const [mode, setMode] = useState<ScanMode>("email");
  const [subject, setSubject] = useState("");
  const [sender, setSender] = useState("");
  const [body, setBody] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [profileUrl, setProfileUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [accountAge, setAccountAge] = useState("");
  const [followers, setFollowers] = useState("");
  const [following, setFollowing] = useState("");
  const [profileDetails, setProfileDetails] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const analyzerRef = useRef<HTMLDivElement>(null);

  // Auto-suppress router unused warning
  useEffect(() => { void router; }, [router]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setAuthChecked(true);
    }).catch(() => {
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    toast.success("Signed out");
  };


  const scrollToAnalyzer = () => {
    analyzerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnalyze = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      toast.error("Please sign in to run a scan");
      navigate({ to: "/auth" });
      return;
    }
    if (mode === "email" && !body.trim()) {
      toast.error("Please paste email content first");
      return;
    }
    if (mode === "profile" && !profileUrl.trim() && !username.trim() && !displayName.trim()) {
      toast.error("Add a profile URL, username, or display name first");
      return;
    }
    if (mode === "website" && !websiteUrl.trim()) {
      toast.error("Enter a website address first");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      let res: ScanAnalysis;
      let summary: string;
      if (mode === "email") {
        res = await analyze({ data: { subject, sender, body } });
        summary = subject || "Email scan";
      } else if (mode === "profile") {
        res = await analyzeProfile({
          data: { platform, profileUrl, displayName, username, bio, accountAge, followers, following, additionalDetails: profileDetails },
        });
        summary = username || displayName || profileUrl;
      } else {
        res = await analyzeSite({ data: { websiteUrl, pageContent } });
        summary = websiteUrl;
      }
      setResult(res);
      setHistory((h) => [
        { id: crypto.randomUUID(), subject: summary, verdict: res.verdict, ts: Date.now() },
        ...h,
      ].slice(0, 5));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubject(""); setSender(""); setBody("");
    setProfileUrl(""); setDisplayName(""); setUsername(""); setBio("");
    setAccountAge(""); setFollowers(""); setFollowing(""); setProfileDetails("");
    setWebsiteUrl(""); setPageContent(""); setResult(null);
  };

  const loadSample = (kind: "phish" | "safe") => {
    const s = kind === "phish" ? SAMPLE_PHISHING : SAMPLE_SAFE;
    setSubject(s.subject); setSender(s.sender); setBody(s.body);
  };

  const copyResult = () => {
    if (!result) return;
    const txt = `PhishGuard AI ${mode} scan\nVerdict: ${formatVerdict(result.verdict)}\nConfidence: ${result.confidence}%\nRisk: ${result.risk_level}\n\n${result.explanation}`;
    navigator.clipboard.writeText(txt);
    toast.success("Result copied to clipboard");
  };

  const shareResult = () => {
    if (!result) return;
    const txt = `PhishGuard AI ${mode} scan\nVerdict: ${formatVerdict(result.verdict)}\nConfidence: ${result.confidence}%\nRisk: ${result.risk_level}`;
    navigator.clipboard.writeText(txt);
    toast.success("Shareable summary copied");
  };

  const exportPdf = () => {
    if (!result) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const M = 48;
    let y = M;

    // Header band
    const isPhish = isRiskyVerdict(result.verdict);
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, W, 90, "F");
    doc.setTextColor(0, 212, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PhishGuard AI", M, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(180, 200, 220);
    doc.text(`${mode === "email" ? "Email" : mode === "profile" ? "Social Profile" : "Website"} Risk Report`, M, 70);
    doc.text(new Date().toLocaleString(), W - M, 70, { align: "right" });
    y = 130;

    // Verdict box
    if (isPhish) doc.setFillColor(255, 59, 59); else doc.setFillColor(0, 200, 120);
    doc.roundedRect(M, y, W - M * 2, 60, 8, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(isPhish ? "SUSPICIOUS SIGNALS FOUND" : "NO STRONG SIGNALS FOUND", M + 20, y + 36);
    doc.setFontSize(11);
    doc.text(`Risk: ${result.risk_level}`, W - M - 20, y + 36, { align: "right" });
    y += 90;

    // Meta
    doc.setTextColor(20, 20, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Summary", M, y); y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Confidence: ${result.confidence.toFixed(1)}%`, M, y); y += 16;
    doc.text(`Verdict: ${formatVerdict(result.verdict)}`, M, y); y += 16;
    doc.text(`Risk Level: ${result.risk_level}`, M, y); y += 24;

    // Confidence bar
    doc.setDrawColor(220); doc.setFillColor(235, 240, 245);
    doc.roundedRect(M, y, W - M * 2, 10, 5, 5, "F");
    if (isPhish) doc.setFillColor(255, 59, 59); else doc.setFillColor(0, 200, 120);
    const bw = Math.min(100, result.confidence) / 100 * (W - M * 2);
    doc.roundedRect(M, y, bw, 10, 5, 5, "F");
    y += 30;

    // Indicators
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("Indicators", M, y); y += 18;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    Object.entries(result.indicators).forEach(([k, v]) => {
      const label = prettyKey(k);
      if (v) doc.setTextColor(200, 30, 30); else doc.setTextColor(0, 140, 80);
      doc.text(`${v ? "⚠" : "✓"}  ${label}`, M, y);
      doc.setTextColor(120);
      doc.text(v ? "Flagged" : "Clear", W - M, y, { align: "right" });
      y += 16;
    });

    y += 14;
    doc.setTextColor(20, 20, 30);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("AI Explanation", M, y); y += 16;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    const lines = doc.splitTextToSize(result.explanation, W - M * 2);
    doc.text(lines, M, y);

    doc.setFontSize(9); doc.setTextColor(150);
    doc.text("Generated by PhishGuard AI · Privacy-first analysis", M, doc.internal.pageSize.getHeight() - 24);

    doc.save(`phishguard-report-${Date.now()}.pdf`);
    toast.success("PDF report downloaded");
  };

  if (!authChecked) {
    return <div className="min-h-screen" />;
  }


  return (
    <div className="min-h-screen text-foreground">
      <Nav onCta={scrollToAnalyzer} userEmail={userEmail} onSignOut={handleSignOut} />
      <Hero onCta={scrollToAnalyzer} />

      <section ref={analyzerRef} className="relative px-4 pt-10 pb-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Analyzer"
            title="Choose what to check"
            subtitle="Assess suspicious emails, social profiles, or websites using details you provide."
          />

          <div className="mt-12 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="glass min-w-0 rounded-lg p-6 md:p-8 lg:col-span-3">
              <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4" role="tablist" aria-label="Threat detector">
                <Button role="tab" aria-selected={mode === "email"} onClick={() => { setMode("email"); setResult(null); }} variant={mode === "email" ? "default" : "outline"} className={mode === "email" ? "bg-primary text-primary-foreground" : "border-border bg-transparent"}>
                  <Mail className="size-4" /> Email
                </Button>
                <Button role="tab" aria-selected={mode === "profile"} onClick={() => { setMode("profile"); setResult(null); }} variant={mode === "profile" ? "default" : "outline"} className={mode === "profile" ? "bg-primary text-primary-foreground" : "border-border bg-transparent"}>
                  <UserRound className="size-4" /> Social profile
                </Button>
                <Button role="tab" aria-selected={mode === "website"} onClick={() => { setMode("website"); setResult(null); }} variant={mode === "website" ? "default" : "outline"} className={mode === "website" ? "bg-primary text-primary-foreground" : "border-border bg-transparent"}>
                  <Globe2 className="size-4" /> Website
                </Button>
              </div>

              {mode === "email" && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={demoMode}
                      onChange={(e) => setDemoMode(e.target.checked)}
                      className="size-4 accent-[oklch(0.78_0.18_230)]"
                    />
                    <FlaskConical className="size-4 text-primary" />
                    <span className="text-muted-foreground">Demo mode</span>
                  </label>
                  {demoMode && (
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => loadSample("phish")} variant="outline" size="sm" className="border-danger/40 bg-danger/10 text-danger hover:bg-danger/20">Load phishing sample</Button>
                      <Button onClick={() => loadSample("safe")} variant="outline" size="sm" className="border-safe/40 bg-safe/10 text-safe hover:bg-safe/20">Load safe sample</Button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {mode === "email" ? (
                  <>
                    <Field icon={<Mail className="size-4" />} label="Subject">
                      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Urgent: verify your account" className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
                    </Field>
                    <Field icon={<AtSign className="size-4" />} label="Sender">
                      <input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="sender@example.com" className="w-full bg-transparent focus:outline-none placeholder:text-muted-foreground/60" />
                    </Field>
                    <div className="rounded-lg border border-border bg-background/40 p-4">
                      <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                        <FileSearch className="size-3.5" /> Email body
                      </label>
                      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Paste your email content here..." rows={10} className="w-full resize-none bg-transparent font-mono text-sm focus:outline-none placeholder:text-muted-foreground/50" />
                    </div>
                  </>
                ) : mode === "profile" ? (
                  <>
                    <Field icon={<Globe2 className="size-4" />} label="Social platform">
                      <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-transparent text-foreground focus:outline-none">
                        <option>Instagram</option><option>Facebook</option><option>TikTok</option><option>X</option><option>LinkedIn</option><option>Other</option>
                      </select>
                    </Field>
                    <Field icon={<Link2 className="size-4" />} label="Profile URL (optional)">
                      <input value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="https://social.example/username" className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field icon={<AtSign className="size-4" />} label="Username">
                        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
                      </Field>
                      <Field icon={<UserRound className="size-4" />} label="Display name">
                        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Profile name" className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
                      </Field>
                    </div>
                    <Field icon={<FileSearch className="size-4" />} label="Bio or profile description">
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Paste the profile bio or description" rows={3} className="w-full resize-y bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50" />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field icon={<Clock className="size-4" />} label="Account age">
                        <input value={accountAge} onChange={(e) => setAccountAge(e.target.value)} placeholder="e.g. 2 months" className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
                      </Field>
                      <Field icon={<UserRound className="size-4" />} label="Followers">
                        <input value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="e.g. 1,200" className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
                      </Field>
                      <Field icon={<UserRound className="size-4" />} label="Following">
                        <input value={following} onChange={(e) => setFollowing(e.target.value)} placeholder="e.g. 350" className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
                      </Field>
                    </div>
                    <Field icon={<FileSearch className="size-4" />} label="Other details (optional)">
                      <textarea value={profileDetails} onChange={(e) => setProfileDetails(e.target.value)} placeholder="Anything else that seems unusual" rows={3} className="w-full resize-y bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50" />
                    </Field>
                    <p className="text-xs text-muted-foreground">Analysis uses only the details you enter; it does not visit the profile or verify its owner.</p>
                  </>
                ) : (
                  <>
                    <div className="space-y-5">
                      <div className="flex items-start gap-3 border-b border-border pb-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                          <Globe2 className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[11px] uppercase text-primary">Website risk check</div>
                          <h3 className="mt-1 text-lg font-semibold">Review a suspicious website</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Assess the address and any page text you choose to share.</p>
                        </div>
                        <span className="hidden shrink-0 rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground sm:inline-flex">URL + text</span>
                      </div>

                      <label className="block" htmlFor="website-address">
                        <span className="flex items-center justify-between gap-3 text-xs uppercase text-muted-foreground">
                          <span>Website address</span>
                          <span className="font-mono text-[10px]">HTTP / HTTPS</span>
                        </span>
                        <span className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3 transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                          <Globe2 className="size-4 shrink-0 text-primary" />
                          <input
                            id="website-address"
                            aria-label="Website address"
                            type="url"
                            maxLength={2048}
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="min-w-0 w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                          />
                        </span>
                      </label>

                      <div className="rounded-lg border border-border bg-background/40 p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label htmlFor="website-page-content" className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                            <FileSearch className="size-3.5" /> Page text <span className="text-muted-foreground/70">optional</span>
                          </label>
                          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{pageContent.length.toLocaleString()} / 10,000</span>
                        </div>
                        <textarea
                          id="website-page-content"
                          aria-label="Page text (optional)"
                          value={pageContent}
                          onChange={(e) => setPageContent(e.target.value)}
                          placeholder="Paste visible page text if you want it assessed too"
                          rows={6}
                          maxLength={10000}
                          className="w-full resize-y bg-transparent font-mono text-sm leading-relaxed focus:outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>

                      <div className="flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                        <Lock className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <p>PhishGuard assesses only the address and text you provide. It does not open or fetch the website.</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="glow-primary h-11 flex-1 min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    {loading ? (
                      <><Loader2 className="size-4 animate-spin" /> Analyzing…</>
                    ) : (
                      <><Sparkles className="size-4" /> {mode === "email" ? "Analyze Email" : mode === "profile" ? "Check Profile" : "Check Website"}</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="h-11 border-border bg-transparent hover:bg-accent">
                    <RotateCcw className="size-4" /> Reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="min-w-0 space-y-6 lg:col-span-2">
              <Tilt max={6}><ResultPanel result={result} loading={loading} onCopy={copyResult} onShare={shareResult} onExport={exportPdf} /></Tilt>
              <HistoryPanel items={history} />
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <Features />
      <Stats />
      <Footer />
    </div>
  );
}

function Nav({ onCta, userEmail, onSignOut }: { onCta: () => void; userEmail: string | null; onSignOut: () => void }) {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Shield className="size-7 text-primary" />
            <div className="absolute inset-0 blur-md bg-primary/40 -z-10" />
          </div>
          <span className="font-bold text-lg tracking-normal">PhishGuard<span className="text-primary"> AI</span></span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {userEmail && (
            <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]">
              {userEmail}
            </span>
          )}
          <Button onClick={onCta} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Scan now <ChevronRight className="size-4" />
          </Button>
          {userEmail ? (
            <Button onClick={onSignOut} size="sm" variant="outline" className="bg-background/40 border-border" title="Sign out">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="outline" className="bg-background/40 border-border">
                Sign in
              </Button>
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}


function Hero({ onCta }: { onCta: () => void }) {
  const shieldRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = shieldRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setTilt({ x: -dy * 30, y: dx * 30 });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <section className="relative overflow-hidden px-4 pt-12 pb-12 md:pt-28 md:pb-32">
      <div className="mx-auto max-w-5xl text-center">
        <div className="perspective-1000 relative mx-auto mb-8 flex size-32 items-center justify-center md:mb-10 md:size-40">
          <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-radar" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-radar" style={{ animationDelay: "0.8s" }} />
          <div className="absolute inset-0 rounded-full border-2 border-warning/40 animate-radar" style={{ animationDelay: "1.6s" }} />
          <div
            ref={shieldRef}
            className="tilt-3d relative z-10 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 via-warning/20 to-primary/5 border border-primary/40 glow-primary md:size-24"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
            }}
          >
            <Shield className="size-10 text-primary md:size-12" style={{ transform: "translateZ(30px)" }} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" style={{ transform: "translateZ(15px)" }} />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
          <span className="size-2 rounded-full bg-safe animate-pulse" />
          AI-powered threat intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-normal leading-[1.05]">
          <span className="text-gradient">PhishGuard AI</span>
        </h1>
        <p className="mt-6 text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Check suspicious emails, social profiles, and websites with clear risk signals and explanations.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button onClick={onCta} size="lg" className="glow-primary h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Start a Scan <Zap className="size-4" />
          </Button>
          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground sm:flex-row">
            <Lock className="size-4 shrink-0" />
            <span>Sent to Gemini for analysis · Not saved by PhishGuard</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tilt({ children, className = "", max = 10 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ x: -py * max, y: px * max });
  };
  const reset = () => setT({ x: 0, y: 0 });
  return (
    <div className={`perspective-1000 ${className}`}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className="tilt-3d h-full"
        style={{ transform: `rotateX(${t.x}deg) rotateY(${t.y}deg)` }}
      >
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-normal">{title}</h2>
      <p className="mt-4 text-muted-foreground md:text-lg">{subtitle}</p>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-4 py-3">
      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

function ResultPanel({
  result, loading, onCopy, onShare, onExport,
}: { result: ScanAnalysis | null; loading: boolean; onCopy: () => void; onShare: () => void; onExport: () => void }) {
  if (loading) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <div className="relative mx-auto size-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-radar" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="size-8 text-primary animate-pulse" />
          </div>
        </div>
        <p className="mt-6 font-mono text-sm text-muted-foreground">Scanning indicators…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <Eye className="mx-auto size-10 text-muted-foreground/60" />
        <h3 className="mt-4 font-semibold">Awaiting input</h3>
        <p className="mt-2 text-sm text-muted-foreground">Your analysis will appear here.</p>
      </div>
    );
  }

  const isPhish = isRiskyVerdict(result.verdict);
  const accent = isPhish ? "danger" : "safe";

  return (
    <div className="glass rounded-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`flex items-center gap-3 rounded-lg border p-4 ${isPhish ? "border-danger/40 bg-danger/10" : "border-safe/40 bg-safe/10"}`}>
        {isPhish ? <ShieldAlert className="size-8 text-danger" /> : <ShieldCheck className="size-8 text-safe" />}
        <div>
          <div className={`text-xs font-mono uppercase tracking-wider ${isPhish ? "text-danger" : "text-safe"}`}>Verdict</div>
          <div className="text-xl font-bold">{formatVerdict(result.verdict)}</div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-mono font-semibold">{result.confidence.toFixed(1)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background/60">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isPhish ? "bg-danger" : "bg-safe"}`}
              style={{ width: `${Math.min(100, result.confidence)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Risk Level</span>
          <RiskBadge level={result.risk_level} />
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Indicators</div>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(result.indicators).map(([k, v]) => (
            <IndicatorRow key={k} label={prettyKey(k)} flagged={v === true} accent={accent as "danger" | "safe"} />
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-background/40 p-4">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">AI Explanation</div>
        <p className="text-sm leading-relaxed">{result.explanation}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onCopy} size="sm" className="border-border bg-transparent">
          <Copy className="size-3.5" /> Copy
        </Button>
        <Button variant="outline" onClick={onShare} size="sm" className="border-border bg-transparent">
          <Share2 className="size-3.5" /> Share
        </Button>
        <Button onClick={onExport} size="sm" className="col-span-2 glow-primary bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
          <FileDown className="size-3.5" /> Export PDF Report
        </Button>
      </div>
    </div>
  );
}

function IndicatorRow({ label, flagged, accent }: { label: string; flagged: boolean; accent: "danger" | "safe" }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-3 py-2 text-sm">
      <span className={flagged ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      {flagged ? (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${accent === "danger" ? "text-danger" : "text-warning"}`}>
          <AlertTriangle className="size-3.5" /> Flagged
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-safe/80">
          <CheckCircle2 className="size-3.5" /> Clear
        </span>
      )}
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Critical: "bg-danger/20 text-danger border-danger/40",
    High: "bg-danger/15 text-danger border-danger/30",
    Medium: "bg-warning/15 text-warning border-warning/40",
    Low: "bg-safe/15 text-safe border-safe/30",
  };
  return (
    <span className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${map[level] ?? ""}`}>
      {level}
    </span>
  );
}

function prettyKey(k: string) {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isRiskyVerdict(verdict: string) {
  return verdict === "PHISHING" || verdict === "SUSPICIOUS";
}

function formatVerdict(verdict: string) {
  if (verdict === "PHISHING") return "Phishing detected";
  if (verdict === "SUSPICIOUS") return "Suspicious signals found";
  if (verdict === "NO_STRONG_SIGNALS") return "No strong signals found";
  return "Safe";
}

function HistoryPanel({ items }: { items: HistoryItem[] }) {
  if (!items.length) return null;
  return (
    <div className="glass rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="size-4 text-primary" />
        <h3 className="font-semibold">Recent scans</h3>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2 text-sm">
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{it.subject}</div>
              <div className="text-xs text-muted-foreground">{new Date(it.ts).toLocaleTimeString()}</div>
            </div>
            <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-semibold ${isRiskyVerdict(it.verdict) ? "bg-danger/15 text-danger" : "bg-safe/15 text-safe"}`}>
              {formatVerdict(it.verdict)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: <FileSearch className="size-6" />, title: "Choose a Check", desc: "Select an email, social profile, or website to assess." },
    { icon: <Sparkles className="size-6" />, title: "Review Evidence", desc: "The analysis highlights risk signals in the information provided." },
    { icon: <ShieldCheck className="size-6" />, title: "Use Your Judgment", desc: "See a confidence estimate, risk level, and explanation." },
  ];
  return (
    <section className="px-4 py-20 md:py-28 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="Workflow" title="How it works" subtitle="Three steps from suspicious message to clear verdict." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="glass rounded-lg p-6 relative">
              <div className="absolute -top-3 left-6 rounded-md bg-primary px-2 py-0.5 text-xs font-mono font-bold text-primary-foreground">
                0{i + 1}
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
                {s.icon}
              </div>
              <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: <Activity />, title: "Three Threat Checks", desc: "Assess emails, social profiles, and websites." },
    { icon: <Link2 />, title: "Risk Indicators", desc: "See which profile, message, or URL signals were flagged." },
    { icon: <Sparkles />, title: "Confidence & Risk", desc: "Review an estimated confidence score and risk level." },
    { icon: <FileSearch />, title: "Clear Explanations", desc: "Understand which details shaped the assessment." },
    { icon: <Zap />, title: "PDF Reports", desc: "Download and share a summary of each scan." },
    { icon: <Lock />, title: "Privacy First", desc: "Details are sent for analysis and are not saved by PhishGuard." },
  ];
  return (
    <section className="px-4 py-20 md:py-28 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow="Capabilities" title="Built to catch what slips past you" subtitle="Every scan runs the same defense-in-depth pipeline." />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {feats.map((f, i) => (
            <Tilt key={i} max={12}>
              <div className="glass rounded-lg p-6 h-full transition hover:border-warning/40 hover:glow-primary">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30 [&_svg]:size-5" style={{ transform: "translateZ(40px)" }}>
                  {f.icon}
                </div>
                <h3 className="mt-4 font-semibold" style={{ transform: "translateZ(20px)" }}>{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: 50000, suffix: "+", label: "Emails Analyzed" },
    { value: 99.2, suffix: "%", label: "Detection Accuracy", decimals: 1 },
    { value: 2, prefix: "<", suffix: "s", label: "Analysis Time" },
    { value: 15, suffix: "+", label: "Phishing Indicators" },
  ];
  return (
    <section className="px-4 py-20 md:py-28 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="glass rounded-lg p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gradient font-mono">
                  <Counter
                    value={s.value}
                    {...(s.decimals === undefined ? {} : { decimals: s.decimals })}
                    {...(s.prefix === undefined ? {} : { prefix: s.prefix })}
                    suffix={s.suffix}
                  />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Counter({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        const start = performance.now();
        const dur = 1500;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / dur);
          setN(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{prefix}{n.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</span>;
}

function Footer() {
  return (
    <footer className="px-4 py-12 border-t border-border">
      <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="size-6 text-primary" />
            <span className="font-bold tracking-normal">PhishGuard <span className="text-primary">AI</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            AI-assisted checks for suspicious emails, social profiles, and websites.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Links</div>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary transition">About</a></li>
            <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition">Contact</a></li>
          </ul>
        </div>
        <div className="md:text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Made with</div>
          <p className="text-sm">Built with AI by <span className="text-gradient font-semibold">Muniba Akram</span></p>
          <p className="text-xs text-muted-foreground mt-2">© 2025 PhishGuard AI</p>
        </div>
      </div>
    </footer>
  );
}










































// import { createFileRoute, useRouter, useNavigate, Link } from "@tanstack/react-router";
// import { useServerFn } from "@tanstack/react-start";
// import { useEffect, useRef, useState } from "react";
// import {
//   Shield, ShieldCheck, ShieldAlert, Loader2, Sparkles, Zap, Lock, Eye,
//   FileSearch, Activity, Copy, RotateCcw, Share2, AlertTriangle, CheckCircle2,
//   Link2, Clock, Mail, AtSign, FlaskConical, ChevronRight, FileDown, LogOut,
// } from "lucide-react";
// import { jsPDF } from "jspdf";
// import { toast } from "sonner";
// import { analyzeEmail, type PhishingAnalysis } from "@/lib/phishing.functions";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Toaster } from "@/components/ui/sonner";

// export const Route = createFileRoute("/")({
//   head: () => ({
//     meta: [
//       { title: "PhishGuard AI — Detect Phishing Emails Instantly" },
//       { name: "description", content: "AI-powered phishing email detection. Paste any email and get an instant verdict with confidence score, risk level, and detailed indicator breakdown." },
//       { property: "og:title", content: "PhishGuard AI — Detect Phishing Emails Instantly" },
//       { property: "og:description", content: "AI-powered phishing email detection with confidence scoring and indicator breakdown." },
//     ],
//   }),
//   component: PhishGuardPage,
// });

// type HistoryItem = {
//   id: string;
//   subject: string;
//   verdict: "PHISHING" | "SAFE";
//   ts: number;
// };

// const SAMPLE_PHISHING = {
//   subject: "URGENT: Your account will be suspended in 24 hours",
//   sender: "security-alert@paypa1-support.com",
//   body: `Dear Valued Customer,

// We have detected unusual activity on your PayPal account. Your account will be PERMANENTLY SUSPENDED within 24 hours unless you verify your identity immediately.

// Click here to verify now: http://paypa1-verify.security-check.tk/login

// Please provide:
// - Full name
// - Social Security Number
// - Credit card details
// - Online banking password

// Failure to act will result in permanent loss of funds.

// Regards,
// PayPal Security Team`,
// };

// const SAMPLE_SAFE = {
//   subject: "Your October invoice is ready",
//   sender: "billing@stripe.com",
//   body: `Hi Alex,

// Your invoice for October 2025 is now available in your Stripe Dashboard. The total of $42.00 was charged to your card ending in 4242.

// You can view or download the invoice anytime from your billing history.

// Thanks for using Stripe,
// The Stripe Team`,
// };

// function PhishGuardPage() {
//   const router = useRouter();
//   const navigate = useNavigate();
//   const analyze = useServerFn(analyzeEmail);
//   const [subject, setSubject] = useState("");
//   const [sender, setSender] = useState("");
//   const [body, setBody] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<PhishingAnalysis | null>(null);
//   const [history, setHistory] = useState<HistoryItem[]>([]);
//   const [demoMode, setDemoMode] = useState(false);
//   const [userEmail, setUserEmail] = useState<string | null>(null);
//   const [authChecked, setAuthChecked] = useState(false);
//   const analyzerRef = useRef<HTMLDivElement>(null);

//   // Auto-suppress router unused warning
//   useEffect(() => { void router; }, [router]);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUserEmail(data.session?.user.email ?? null);
//       setAuthChecked(true);
//     });
//     const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
//       setUserEmail(session?.user.email ?? null);
//     });
//     return () => sub.subscription.unsubscribe();
//   }, []);

//   const handleSignOut = async () => {
//     await supabase.auth.signOut();
//     setUserEmail(null);
//     toast.success("Signed out");
//   };


//   const scrollToAnalyzer = () => {
//     analyzerRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const handleAnalyze = async () => {
//     const { data: sess } = await supabase.auth.getSession();
//     if (!sess.session) {
//       toast.error("Please sign in to analyze emails");
//       navigate({ to: "/auth" });
//       return;
//     }
//     if (!body.trim()) {
//       toast.error("Please paste email content first");
//       return;
//     }

//     setLoading(true);
//     setResult(null);
//     try {
//       const res = await analyze({ data: { subject, sender, body } });
//       setResult(res);
//       setHistory((h) => [
//         { id: crypto.randomUUID(), subject: subject || "(no subject)", verdict: res.verdict, ts: Date.now() },
//         ...h,
//       ].slice(0, 5));
//     } catch (e) {
//       toast.error(e instanceof Error ? e.message : "Analysis failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setSubject(""); setSender(""); setBody(""); setResult(null);
//   };

//   const loadSample = (kind: "phish" | "safe") => {
//     const s = kind === "phish" ? SAMPLE_PHISHING : SAMPLE_SAFE;
//     setSubject(s.subject); setSender(s.sender); setBody(s.body);
//   };

//   const copyResult = () => {
//     if (!result) return;
//     const txt = `PhishGuard AI Verdict: ${result.verdict}\nConfidence: ${result.confidence}%\nRisk: ${result.risk_level}\n\n${result.explanation}`;
//     navigator.clipboard.writeText(txt);
//     toast.success("Result copied to clipboard");
//   };

//   const shareResult = () => {
//     if (!result) return;
//     const txt = `🛡️ PhishGuard AI analyzed an email\nVerdict: ${result.verdict === "PHISHING" ? "🚨 PHISHING" : "✅ SAFE"}\nConfidence: ${result.confidence}%\nRisk: ${result.risk_level}`;
//     navigator.clipboard.writeText(txt);
//     toast.success("Shareable summary copied");
//   };

//   const exportPdf = () => {
//     if (!result) return;
//     const doc = new jsPDF({ unit: "pt", format: "a4" });
//     const W = doc.internal.pageSize.getWidth();
//     const M = 48;
//     let y = M;

//     // Header band
//     const isPhish = result.verdict === "PHISHING";
//     doc.setFillColor(10, 15, 30);
//     doc.rect(0, 0, W, 90, "F");
//     doc.setTextColor(0, 212, 255);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(22);
//     doc.text("PhishGuard AI", M, 50);
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(10);
//     doc.setTextColor(180, 200, 220);
//     doc.text("Phishing Analysis Report", M, 70);
//     doc.text(new Date().toLocaleString(), W - M, 70, { align: "right" });
//     y = 130;

//     // Verdict box
//     if (isPhish) doc.setFillColor(255, 59, 59); else doc.setFillColor(0, 200, 120);
//     doc.roundedRect(M, y, W - M * 2, 60, 8, 8, "F");
//     doc.setTextColor(255, 255, 255);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(18);
//     doc.text(isPhish ? "PHISHING DETECTED" : "SAFE EMAIL", M + 20, y + 36);
//     doc.setFontSize(11);
//     doc.text(`Risk: ${result.risk_level}`, W - M - 20, y + 36, { align: "right" });
//     y += 90;

//     // Meta
//     doc.setTextColor(20, 20, 30);
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(12);
//     doc.text("Summary", M, y); y += 18;
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(11);
//     doc.text(`Confidence: ${result.confidence.toFixed(1)}%`, M, y); y += 16;
//     doc.text(`Verdict: ${result.verdict}`, M, y); y += 16;
//     doc.text(`Risk Level: ${result.risk_level}`, M, y); y += 24;

//     // Confidence bar
//     doc.setDrawColor(220); doc.setFillColor(235, 240, 245);
//     doc.roundedRect(M, y, W - M * 2, 10, 5, 5, "F");
//     if (isPhish) doc.setFillColor(255, 59, 59); else doc.setFillColor(0, 200, 120);
//     const bw = Math.min(100, result.confidence) / 100 * (W - M * 2);
//     doc.roundedRect(M, y, bw, 10, 5, 5, "F");
//     y += 30;

//     // Indicators
//     doc.setFont("helvetica", "bold"); doc.setFontSize(12);
//     doc.text("Indicators", M, y); y += 18;
//     doc.setFont("helvetica", "normal"); doc.setFontSize(11);
//     Object.entries(result.indicators).forEach(([k, v]) => {
//       const label = prettyKey(k);
//       if (v) doc.setTextColor(200, 30, 30); else doc.setTextColor(0, 140, 80);
//       doc.text(`${v ? "⚠" : "✓"}  ${label}`, M, y);
//       doc.setTextColor(120);
//       doc.text(v ? "Flagged" : "Clear", W - M, y, { align: "right" });
//       y += 16;
//     });

//     y += 14;
//     doc.setTextColor(20, 20, 30);
//     doc.setFont("helvetica", "bold"); doc.setFontSize(12);
//     doc.text("AI Explanation", M, y); y += 16;
//     doc.setFont("helvetica", "normal"); doc.setFontSize(11);
//     const lines = doc.splitTextToSize(result.explanation, W - M * 2);
//     doc.text(lines, M, y);

//     doc.setFontSize(9); doc.setTextColor(150);
//     doc.text("Generated by PhishGuard AI · Privacy-first analysis", M, doc.internal.pageSize.getHeight() - 24);

//     doc.save(`phishguard-report-${Date.now()}.pdf`);
//     toast.success("PDF report downloaded");
//   };

//   if (!authChecked) {
//     return <div className="min-h-screen" />;
//   }


//   return (
//     <div className="min-h-screen text-foreground">
//       <Toaster theme="dark" position="top-center" richColors />
//       <Nav onCta={scrollToAnalyzer} userEmail={userEmail} onSignOut={handleSignOut} />
//       <Hero onCta={scrollToAnalyzer} />

//       <section ref={analyzerRef} className="relative px-4 py-20 md:py-28">
//         <div className="mx-auto max-w-6xl">
//           <SectionHeader
//             eyebrow="Analyzer"
//             title="Scan an email in seconds"
//             subtitle="Paste any suspicious message. Our AI inspects 15+ signals and returns a verdict instantly."
//           />

//           <div className="mt-12 grid gap-8 lg:grid-cols-5">
//             <div className="glass rounded-2xl p-6 md:p-8 lg:col-span-3">
//               <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//                 <label className="flex items-center gap-2 text-sm">
//                   <input
//                     type="checkbox"
//                     checked={demoMode}
//                     onChange={(e) => setDemoMode(e.target.checked)}
//                     className="size-4 accent-[oklch(0.78_0.18_230)]"
//                   />
//                   <FlaskConical className="size-4 text-primary" />
//                   <span className="text-muted-foreground">Demo mode</span>
//                 </label>
//                 {demoMode && (
//                   <div className="flex gap-2">
//                     <button onClick={() => loadSample("phish")} className="rounded-md border border-danger/40 bg-danger/10 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/20 transition">
//                       Load phishing sample
//                     </button>
//                     <button onClick={() => loadSample("safe")} className="rounded-md border border-safe/40 bg-safe/10 px-3 py-1 text-xs font-medium text-safe hover:bg-safe/20 transition">
//                       Load safe sample
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <div className="space-y-4">
//                 <Field icon={<Mail className="size-4" />} label="Subject">
//                   <input
//                     value={subject}
//                     onChange={(e) => setSubject(e.target.value)}
//                     placeholder="e.g. Urgent: verify your account"
//                     className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
//                   />
//                 </Field>
//                 <Field icon={<AtSign className="size-4" />} label="Sender">
//                   <input
//                     value={sender}
//                     onChange={(e) => setSender(e.target.value)}
//                     placeholder="sender@example.com"
//                     className="w-full bg-transparent focus:outline-none placeholder:text-muted-foreground/60"
//                   />
//                 </Field>
//                 <div className="rounded-xl border border-border bg-background/40 p-4">
//                   <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
//                     <FileSearch className="size-3.5" /> Email body
//                   </label>
//                   <textarea
//                     value={body}
//                     onChange={(e) => setBody(e.target.value)}
//                     placeholder="Paste your email content here..."
//                     rows={10}
//                     className="w-full resize-none bg-transparent font-mono text-sm focus:outline-none placeholder:text-muted-foreground/50"
//                   />
//                 </div>

//                 <div className="flex flex-wrap gap-3">
//                   <Button
//                     onClick={handleAnalyze}
//                     disabled={loading}
//                     className="glow-primary h-11 flex-1 min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
//                   >
//                     {loading ? (
//                       <><Loader2 className="size-4 animate-spin" /> Analyzing…</>
//                     ) : (
//                       <><Sparkles className="size-4" /> Analyze Now</>
//                     )}
//                   </Button>
//                   <Button variant="outline" onClick={handleReset} className="h-11 border-border bg-transparent hover:bg-accent">
//                     <RotateCcw className="size-4" /> Reset
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             <div className="lg:col-span-2 space-y-6">
//               <Tilt max={6}><ResultPanel result={result} loading={loading} onCopy={copyResult} onShare={shareResult} onExport={exportPdf} /></Tilt>
//               <HistoryPanel items={history} />
//             </div>
//           </div>
//         </div>
//       </section>

//       <HowItWorks />
//       <Features />
//       <Stats />
//       <Footer />
//     </div>
//   );
// }

// function Nav({ onCta, userEmail, onSignOut }: { onCta: () => void; userEmail: string | null; onSignOut: () => void }) {
//   return (
//     <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border">
//       <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
//         <div className="flex items-center gap-2">
//           <div className="relative">
//             <Shield className="size-7 text-primary" />
//             <div className="absolute inset-0 blur-md bg-primary/40 -z-10" />
//           </div>
//           <span className="font-bold text-lg tracking-tight">PhishGuard<span className="text-primary"> AI</span></span>
//         </div>
//         <div className="flex items-center gap-2 sm:gap-3">
//           {userEmail && (
//             <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]">
//               {userEmail}
//             </span>
//           )}
//           <Button onClick={onCta} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
//             Analyze <ChevronRight className="size-4" />
//           </Button>
//           {userEmail ? (
//             <Button onClick={onSignOut} size="sm" variant="outline" className="bg-background/40 border-border" title="Sign out">
//               <LogOut className="size-4" />
//               <span className="hidden sm:inline">Sign out</span>
//             </Button>
//           ) : (
//             <Link to="/auth">
//               <Button size="sm" variant="outline" className="bg-background/40 border-border">
//                 Sign in
//               </Button>
//             </Link>
//           )}

//         </div>
//       </div>
//     </nav>
//   );
// }


// function Hero({ onCta }: { onCta: () => void }) {
//   const shieldRef = useRef<HTMLDivElement>(null);
//   const [tilt, setTilt] = useState({ x: 0, y: 0 });

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       const el = shieldRef.current;
//       if (!el) return;
//       const r = el.getBoundingClientRect();
//       const cx = r.left + r.width / 2;
//       const cy = r.top + r.height / 2;
//       const dx = (e.clientX - cx) / window.innerWidth;
//       const dy = (e.clientY - cy) / window.innerHeight;
//       setTilt({ x: -dy * 30, y: dx * 30 });
//     };
//     window.addEventListener("mousemove", handler);
//     return () => window.removeEventListener("mousemove", handler);
//   }, []);

//   return (
//     <section className="relative overflow-hidden px-4 pt-20 pb-24 md:pt-28 md:pb-32">
//       <div className="mx-auto max-w-5xl text-center">
//         <div className="perspective-1000 relative mx-auto mb-10 flex size-32 items-center justify-center md:size-40">
//           <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-radar" />
//           <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-radar" style={{ animationDelay: "0.8s" }} />
//           <div className="absolute inset-0 rounded-full border-2 border-neon-purple/40 animate-radar" style={{ animationDelay: "1.6s" }} />
//           <div
//             ref={shieldRef}
//             className="tilt-3d relative z-10 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 via-neon-purple/20 to-primary/5 border border-primary/40 glow-primary md:size-24"
//             style={{
//               transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
//             }}
//           >
//             <Shield className="size-10 text-primary md:size-12" style={{ transform: "translateZ(30px)" }} />
//             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" style={{ transform: "translateZ(15px)" }} />
//           </div>
//         </div>

//         <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
//           <span className="size-2 rounded-full bg-safe animate-pulse" />
//           AI-powered threat intelligence
//         </div>

//         <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
//           <span className="text-gradient">PhishGuard AI</span>
//         </h1>
//         <p className="mt-6 text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto">
//           Detect phishing emails instantly with AI. Paste a message, get a verdict in under two seconds.
//         </p>

//         <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
//           <Button onClick={onCta} size="lg" className="glow-primary h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
//             Analyze Email Now <Zap className="size-4" />
//           </Button>
//           <div className="flex items-center gap-2 text-sm text-muted-foreground">
//             <Lock className="size-4" /> Privacy-first · No data stored
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function Tilt({ children, className = "", max = 10 }: { children: React.ReactNode; className?: string; max?: number }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const [t, setT] = useState({ x: 0, y: 0 });
//   const onMove = (e: React.MouseEvent) => {
//     const el = ref.current; if (!el) return;
//     const r = el.getBoundingClientRect();
//     const px = (e.clientX - r.left) / r.width - 0.5;
//     const py = (e.clientY - r.top) / r.height - 0.5;
//     setT({ x: -py * max, y: px * max });
//   };
//   const reset = () => setT({ x: 0, y: 0 });
//   return (
//     <div className={`perspective-1000 ${className}`}>
//       <div
//         ref={ref}
//         onMouseMove={onMove}
//         onMouseLeave={reset}
//         className="tilt-3d h-full"
//         style={{ transform: `rotateX(${t.x}deg) rotateY(${t.y}deg)` }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

// function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
//   return (
//     <div className="text-center max-w-2xl mx-auto">
//       <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
//       <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">{title}</h2>
//       <p className="mt-4 text-muted-foreground md:text-lg">{subtitle}</p>
//     </div>
//   );
// }

// function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
//   return (
//     <div className="rounded-xl border border-border bg-background/40 px-4 py-3">
//       <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
//         {icon} {label}
//       </div>
//       {children}
//     </div>
//   );
// }

// function ResultPanel({
//   result, loading, onCopy, onShare, onExport,
// }: { result: PhishingAnalysis | null; loading: boolean; onCopy: () => void; onShare: () => void; onExport: () => void }) {
//   if (loading) {
//     return (
//       <div className="glass rounded-2xl p-8 text-center">
//         <div className="relative mx-auto size-16">
//           <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-radar" />
//           <div className="absolute inset-0 flex items-center justify-center">
//             <Activity className="size-8 text-primary animate-pulse" />
//           </div>
//         </div>
//         <p className="mt-6 font-mono text-sm text-muted-foreground">Scanning indicators…</p>
//       </div>
//     );
//   }

//   if (!result) {
//     return (
//       <div className="glass rounded-2xl p-8 text-center">
//         <Eye className="mx-auto size-10 text-muted-foreground/60" />
//         <h3 className="mt-4 font-semibold">Awaiting input</h3>
//         <p className="mt-2 text-sm text-muted-foreground">Your analysis will appear here.</p>
//       </div>
//     );
//   }

//   const isPhish = result.verdict === "PHISHING";
//   const accent = isPhish ? "danger" : "safe";

//   return (
//     <div className="glass rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
//       <div className={`flex items-center gap-3 rounded-xl border p-4 ${isPhish ? "border-danger/40 bg-danger/10" : "border-safe/40 bg-safe/10"}`}>
//         {isPhish ? <ShieldAlert className="size-8 text-danger" /> : <ShieldCheck className="size-8 text-safe" />}
//         <div>
//           <div className={`text-xs font-mono uppercase tracking-wider ${isPhish ? "text-danger" : "text-safe"}`}>Verdict</div>
//           <div className="text-xl font-bold">
//             {isPhish ? "🚨 Phishing Detected" : "✅ Safe"}
//           </div>
//         </div>
//       </div>

//       <div className="mt-5 space-y-4">
//         <div>
//           <div className="flex items-center justify-between text-sm mb-2">
//             <span className="text-muted-foreground">Confidence</span>
//             <span className="font-mono font-semibold">{result.confidence.toFixed(1)}%</span>
//           </div>
//           <div className="h-2 overflow-hidden rounded-full bg-background/60">
//             <div
//               className={`h-full rounded-full transition-all duration-1000 ${isPhish ? "bg-danger" : "bg-safe"}`}
//               style={{ width: `${Math.min(100, result.confidence)}%` }}
//             />
//           </div>
//         </div>

//         <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
//           <span className="text-muted-foreground">Risk Level</span>
//           <RiskBadge level={result.risk_level} />
//         </div>
//       </div>

//       <div className="mt-5">
//         <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Indicators</div>
//         <div className="grid grid-cols-1 gap-2">
//           {Object.entries(result.indicators).map(([k, v]) => (
//             <IndicatorRow key={k} label={prettyKey(k)} flagged={v} accent={accent as "danger" | "safe"} />
//           ))}
//         </div>
//       </div>

//       <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
//         <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">AI Explanation</div>
//         <p className="text-sm leading-relaxed">{result.explanation}</p>
//       </div>

//       <div className="mt-5 grid grid-cols-2 gap-2">
//         <Button variant="outline" onClick={onCopy} size="sm" className="border-border bg-transparent">
//           <Copy className="size-3.5" /> Copy
//         </Button>
//         <Button variant="outline" onClick={onShare} size="sm" className="border-border bg-transparent">
//           <Share2 className="size-3.5" /> Share
//         </Button>
//         <Button onClick={onExport} size="sm" className="col-span-2 glow-primary bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
//           <FileDown className="size-3.5" /> Export PDF Report
//         </Button>
//       </div>
//     </div>
//   );
// }

// function IndicatorRow({ label, flagged, accent }: { label: string; flagged: boolean; accent: "danger" | "safe" }) {
//   return (
//     <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-3 py-2 text-sm">
//       <span className={flagged ? "text-foreground" : "text-muted-foreground"}>{label}</span>
//       {flagged ? (
//         <span className={`inline-flex items-center gap-1 text-xs font-semibold ${accent === "danger" ? "text-danger" : "text-warning"}`}>
//           <AlertTriangle className="size-3.5" /> Flagged
//         </span>
//       ) : (
//         <span className="inline-flex items-center gap-1 text-xs text-safe/80">
//           <CheckCircle2 className="size-3.5" /> Clear
//         </span>
//       )}
//     </div>
//   );
// }

// function RiskBadge({ level }: { level: string }) {
//   const map: Record<string, string> = {
//     Critical: "bg-danger/20 text-danger border-danger/40",
//     High: "bg-danger/15 text-danger border-danger/30",
//     Medium: "bg-neon-purple/15 text-neon-purple border-neon-purple/40",
//     Low: "bg-safe/15 text-safe border-safe/30",
//   };
//   return (
//     <span className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${map[level] ?? ""}`}>
//       {level}
//     </span>
//   );
// }

// function prettyKey(k: string) {
//   return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
// }

// function HistoryPanel({ items }: { items: HistoryItem[] }) {
//   if (!items.length) return null;
//   return (
//     <div className="glass rounded-2xl p-6">
//       <div className="flex items-center gap-2 mb-4">
//         <Clock className="size-4 text-primary" />
//         <h3 className="font-semibold">Recent scans</h3>
//       </div>
//       <div className="space-y-2">
//         {items.map((it) => (
//           <div key={it.id} className="flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2 text-sm">
//             <div className="min-w-0 flex-1">
//               <div className="truncate font-medium">{it.subject}</div>
//               <div className="text-xs text-muted-foreground">{new Date(it.ts).toLocaleTimeString()}</div>
//             </div>
//             <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-semibold ${it.verdict === "PHISHING" ? "bg-danger/15 text-danger" : "bg-safe/15 text-safe"}`}>
//               {it.verdict}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function HowItWorks() {
//   const steps = [
//     { icon: <Mail className="size-6" />, title: "Paste Email", desc: "Drop the subject, sender, and body into the analyzer." },
//     { icon: <Sparkles className="size-6" />, title: "AI Analyzes", desc: "Our model inspects links, language, and sender signals." },
//     { icon: <ShieldCheck className="size-6" />, title: "Get Result", desc: "Receive a verdict, confidence score, and breakdown." },
//   ];
//   return (
//     <section className="px-4 py-20 md:py-28 border-t border-border">
//       <div className="mx-auto max-w-6xl">
//         <SectionHeader eyebrow="Workflow" title="How it works" subtitle="Three steps from suspicious message to clear verdict." />
//         <div className="mt-12 grid gap-6 md:grid-cols-3">
//           {steps.map((s, i) => (
//             <div key={i} className="glass rounded-2xl p-6 relative">
//               <div className="absolute -top-3 left-6 rounded-md bg-primary px-2 py-0.5 text-xs font-mono font-bold text-primary-foreground">
//                 0{i + 1}
//               </div>
//               <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
//                 {s.icon}
//               </div>
//               <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
//               <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Features() {
//   const feats = [
//     { icon: <Activity />, title: "Real-time AI Analysis", desc: "Sub-second classification powered by frontier models." },
//     { icon: <Link2 />, title: "Multi-indicator Detection", desc: "15+ heuristic and semantic signals checked." },
//     { icon: <Sparkles />, title: "Confidence Scoring", desc: "Calibrated percentage so you know how sure we are." },
//     { icon: <FileSearch />, title: "Detailed Reports", desc: "See exactly which indicators triggered the verdict." },
//     { icon: <Zap />, title: "Instant Results", desc: "Most scans return in under two seconds." },
//     { icon: <Lock />, title: "Privacy First", desc: "We never store the email content you paste." },
//   ];
//   return (
//     <section className="px-4 py-20 md:py-28 border-t border-border">
//       <div className="mx-auto max-w-6xl">
//         <SectionHeader eyebrow="Capabilities" title="Built to catch what slips past you" subtitle="Every scan runs the same defense-in-depth pipeline." />
//         <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {feats.map((f, i) => (
//             <Tilt key={i} max={12}>
//               <div className="glass rounded-2xl p-6 h-full transition hover:border-neon-purple/40 hover:glow-purple">
//                 <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30 [&_svg]:size-5" style={{ transform: "translateZ(40px)" }}>
//                   {f.icon}
//                 </div>
//                 <h3 className="mt-4 font-semibold" style={{ transform: "translateZ(20px)" }}>{f.title}</h3>
//                 <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
//               </div>
//             </Tilt>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Stats() {
//   const stats = [
//     { value: 50000, suffix: "+", label: "Emails Analyzed" },
//     { value: 99.2, suffix: "%", label: "Detection Accuracy", decimals: 1 },
//     { value: 2, prefix: "<", suffix: "s", label: "Analysis Time" },
//     { value: 15, suffix: "+", label: "Phishing Indicators" },
//   ];
//   return (
//     <section className="px-4 py-20 md:py-28 border-t border-border">
//       <div className="mx-auto max-w-6xl">
//         <div className="glass rounded-3xl p-8 md:p-12">
//           <div className="grid gap-8 md:grid-cols-4">
//             {stats.map((s, i) => (
//               <div key={i} className="text-center">
//                 <div className="text-4xl md:text-5xl font-bold text-gradient font-mono">
//                   <Counter value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
//                 </div>
//                 <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function Counter({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
//   const [n, setN] = useState(0);
//   const ref = useRef<HTMLSpanElement>(null);
//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     const obs = new IntersectionObserver((entries) => {
//       if (entries[0].isIntersecting) {
//         const start = performance.now();
//         const dur = 1500;
//         const tick = (now: number) => {
//           const p = Math.min(1, (now - start) / dur);
//           setN(value * (1 - Math.pow(1 - p, 3)));
//           if (p < 1) requestAnimationFrame(tick);
//         };
//         requestAnimationFrame(tick);
//         obs.disconnect();
//       }
//     });
//     obs.observe(el);
//     return () => obs.disconnect();
//   }, [value]);
//   return <span ref={ref}>{prefix}{n.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</span>;
// }

// function Footer() {
//   return (
//     <footer className="px-4 py-12 border-t border-border">
//       <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
//         <div>
//           <div className="flex items-center gap-2">
//             <Shield className="size-6 text-primary" />
//             <span className="font-bold tracking-tight">PhishGuard <span className="text-primary">AI</span></span>
//           </div>
//           <p className="mt-3 text-sm text-muted-foreground max-w-xs">
//             AI-powered phishing email detection. Built for individuals and security teams.
//           </p>
//         </div>
//         <div>
//           <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Links</div>
//           <ul className="space-y-2 text-sm">
//             <li><a href="#" className="hover:text-primary transition">About</a></li>
//             <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
//             <li><a href="#" className="hover:text-primary transition">Contact</a></li>
//           </ul>
//         </div>
//         <div className="md:text-right">
//           <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Made with</div>
//           <p className="text-sm">Built with AI by <span className="text-gradient font-semibold">Muniba Akram</span></p>
//           <p className="text-xs text-muted-foreground mt-2">© 2025 PhishGuard AI</p>
//         </div>
//       </div>
//     </footer>
//   );
// }
