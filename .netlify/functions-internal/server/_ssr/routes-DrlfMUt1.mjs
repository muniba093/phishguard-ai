import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CJCEtu0k.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { N as useNavigate, P as useRouter, T as isRedirect, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Toaster$1, t as Button } from "./sonner-ksNSMzZV.mjs";
import { C as LoaderCircle, S as Sparkles, _ as ChevronRight, a as Share2, b as Activity, c as LogOut, d as FlaskConical, f as FileSearch, g as Clock, h as Copy, i as ShieldAlert, l as Lock, m as Eye, n as Shield, o as RotateCcw, p as FileDown, r as ShieldCheck, s as Mail, t as Zap, u as Link2, v as AtSign, w as CircleCheck, x as TriangleAlert } from "../_libs/lucide-react.mjs";
import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-Dova13aH.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-zxqm9RrJ.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DrlfMUt1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jspdf_node_min = require_jspdf_node_min();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var InputSchema = objectType({
	subject: stringType().max(500),
	sender: stringType().max(200),
	body: stringType().min(1).max(2e4)
});
var analyzeEmail = createServerFn({ method: "POST" }).inputValidator((d) => InputSchema.parse(d)).handler(createSsrRpc("7f0f53526890a1d5aae8d4759a15c0ed46944f380fbb2bec4afe394be0760c9c"));
var SAMPLE_PHISHING = {
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
PayPal Security Team`
};
var SAMPLE_SAFE = {
	subject: "Your October invoice is ready",
	sender: "billing@stripe.com",
	body: `Hi Alex,

Your invoice for October 2025 is now available in your Stripe Dashboard. The total of $42.00 was charged to your card ending in 4242.

You can view or download the invoice anytime from your billing history.

Thanks for using Stripe,
The Stripe Team`
};
function PhishGuardPage() {
	const router = useRouter();
	const navigate = useNavigate();
	const analyze = useServerFn(analyzeEmail);
	const [subject, setSubject] = (0, import_react.useState)("");
	const [sender, setSender] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [demoMode, setDemoMode] = (0, import_react.useState)(false);
	const [userEmail, setUserEmail] = (0, import_react.useState)(null);
	const [authChecked, setAuthChecked] = (0, import_react.useState)(false);
	const analyzerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {}, [router]);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			setUserEmail(data.session?.user.email ?? null);
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
		const { data: sess } = await supabase.auth.getSession();
		if (!sess.session) {
			toast.error("Please sign in to analyze emails");
			navigate({ to: "/auth" });
			return;
		}
		if (!body.trim()) {
			toast.error("Please paste email content first");
			return;
		}
		setLoading(true);
		setResult(null);
		try {
			const res = await analyze({ data: {
				subject,
				sender,
				body
			} });
			setResult(res);
			setHistory((h) => [{
				id: crypto.randomUUID(),
				subject: subject || "(no subject)",
				verdict: res.verdict,
				ts: Date.now()
			}, ...h].slice(0, 5));
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Analysis failed");
		} finally {
			setLoading(false);
		}
	};
	const handleReset = () => {
		setSubject("");
		setSender("");
		setBody("");
		setResult(null);
	};
	const loadSample = (kind) => {
		const s = kind === "phish" ? SAMPLE_PHISHING : SAMPLE_SAFE;
		setSubject(s.subject);
		setSender(s.sender);
		setBody(s.body);
	};
	const copyResult = () => {
		if (!result) return;
		const txt = `PhishGuard AI Verdict: ${result.verdict}\nConfidence: ${result.confidence}%\nRisk: ${result.risk_level}\n\n${result.explanation}`;
		navigator.clipboard.writeText(txt);
		toast.success("Result copied to clipboard");
	};
	const shareResult = () => {
		if (!result) return;
		const txt = `🛡️ PhishGuard AI analyzed an email\nVerdict: ${result.verdict === "PHISHING" ? "🚨 PHISHING" : "✅ SAFE"}\nConfidence: ${result.confidence}%\nRisk: ${result.risk_level}`;
		navigator.clipboard.writeText(txt);
		toast.success("Shareable summary copied");
	};
	const exportPdf = () => {
		if (!result) return;
		const doc = new import_jspdf_node_min.jsPDF({
			unit: "pt",
			format: "a4"
		});
		const W = doc.internal.pageSize.getWidth();
		const M = 48;
		let y = M;
		const isPhish = result.verdict === "PHISHING";
		doc.setFillColor(10, 15, 30);
		doc.rect(0, 0, W, 90, "F");
		doc.setTextColor(0, 212, 255);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(22);
		doc.text("PhishGuard AI", M, 50);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.setTextColor(180, 200, 220);
		doc.text("Phishing Analysis Report", M, 70);
		doc.text((/* @__PURE__ */ new Date()).toLocaleString(), W - M, 70, { align: "right" });
		y = 130;
		if (isPhish) doc.setFillColor(255, 59, 59);
		else doc.setFillColor(0, 200, 120);
		doc.roundedRect(M, y, W - M * 2, 60, 8, 8, "F");
		doc.setTextColor(255, 255, 255);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(18);
		doc.text(isPhish ? "PHISHING DETECTED" : "SAFE EMAIL", 68, y + 36);
		doc.setFontSize(11);
		doc.text(`Risk: ${result.risk_level}`, W - M - 20, y + 36, { align: "right" });
		y += 90;
		doc.setTextColor(20, 20, 30);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(12);
		doc.text("Summary", M, y);
		y += 18;
		doc.setFont("helvetica", "normal");
		doc.setFontSize(11);
		doc.text(`Confidence: ${result.confidence.toFixed(1)}%`, M, y);
		y += 16;
		doc.text(`Verdict: ${result.verdict}`, M, y);
		y += 16;
		doc.text(`Risk Level: ${result.risk_level}`, M, y);
		y += 24;
		doc.setDrawColor(220);
		doc.setFillColor(235, 240, 245);
		doc.roundedRect(M, y, W - M * 2, 10, 5, 5, "F");
		if (isPhish) doc.setFillColor(255, 59, 59);
		else doc.setFillColor(0, 200, 120);
		const bw = Math.min(100, result.confidence) / 100 * (W - M * 2);
		doc.roundedRect(M, y, bw, 10, 5, 5, "F");
		y += 30;
		doc.setFont("helvetica", "bold");
		doc.setFontSize(12);
		doc.text("Indicators", M, y);
		y += 18;
		doc.setFont("helvetica", "normal");
		doc.setFontSize(11);
		Object.entries(result.indicators).forEach(([k, v]) => {
			const label = prettyKey(k);
			if (v) doc.setTextColor(200, 30, 30);
			else doc.setTextColor(0, 140, 80);
			doc.text(`${v ? "⚠" : "✓"}  ${label}`, M, y);
			doc.setTextColor(120);
			doc.text(v ? "Flagged" : "Clear", W - M, y, { align: "right" });
			y += 16;
		});
		y += 14;
		doc.setTextColor(20, 20, 30);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(12);
		doc.text("AI Explanation", M, y);
		y += 16;
		doc.setFont("helvetica", "normal");
		doc.setFontSize(11);
		const lines = doc.splitTextToSize(result.explanation, W - M * 2);
		doc.text(lines, M, y);
		doc.setFontSize(9);
		doc.setTextColor(150);
		doc.text("Generated by PhishGuard AI · Privacy-first analysis", M, doc.internal.pageSize.getHeight() - 24);
		doc.save(`phishguard-report-${Date.now()}.pdf`);
		toast.success("PDF report downloaded");
	};
	if (!authChecked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-screen" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				theme: "dark",
				position: "top-center",
				richColors: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {
				onCta: scrollToAnalyzer,
				userEmail,
				onSignOut: handleSignOut
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, { onCta: scrollToAnalyzer }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				ref: analyzerRef,
				className: "relative px-4 py-20 md:py-28",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-6xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						eyebrow: "Analyzer",
						title: "Scan an email in seconds",
						subtitle: "Paste any suspicious message. Our AI inspects 15+ signals and returns a verdict instantly."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-12 grid gap-8 lg:grid-cols-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass rounded-2xl p-6 md:p-8 lg:col-span-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: demoMode,
											onChange: (e) => setDemoMode(e.target.checked),
											className: "size-4 accent-[oklch(0.78_0.18_230)]"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-4 text-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Demo mode"
										})
									]
								}), demoMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => loadSample("phish"),
										className: "rounded-md border border-danger/40 bg-danger/10 px-3 py-1 text-xs font-medium text-danger hover:bg-danger/20 transition",
										children: "Load phishing sample"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => loadSample("safe"),
										className: "rounded-md border border-safe/40 bg-safe/10 px-3 py-1 text-xs font-medium text-safe hover:bg-safe/20 transition",
										children: "Load safe sample"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }),
										label: "Subject",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: subject,
											onChange: (e) => setSubject(e.target.value),
											placeholder: "e.g. Urgent: verify your account",
											className: "w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "size-4" }),
										label: "Sender",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: sender,
											onChange: (e) => setSender(e.target.value),
											placeholder: "sender@example.com",
											className: "w-full bg-transparent focus:outline-none placeholder:text-muted-foreground/60"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border bg-background/40 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSearch, { className: "size-3.5" }), " Email body"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											value: body,
											onChange: (e) => setBody(e.target.value),
											placeholder: "Paste your email content here...",
											rows: 10,
											className: "w-full resize-none bg-transparent font-mono text-sm focus:outline-none placeholder:text-muted-foreground/50"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: handleAnalyze,
											disabled: loading,
											className: "glow-primary h-11 flex-1 min-w-[160px] bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
											children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Analyzing…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " Analyze Now"] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											onClick: handleReset,
											className: "h-11 border-border bg-transparent hover:bg-accent",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), " Reset"]
										})]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "lg:col-span-2 space-y-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tilt, {
								max: 6,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultPanel, {
									result,
									loading,
									onCopy: copyResult,
									onShare: shareResult,
									onExport: exportPdf
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPanel, { items: history })]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Features, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
function Nav({ onCta, userEmail, onSignOut }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl items-center justify-between px-4 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-7 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 blur-md bg-primary/40 -z-10" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-bold text-lg tracking-tight",
					children: ["PhishGuard", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary",
						children: " AI"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 sm:gap-3",
				children: [
					userEmail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]",
						children: userEmail
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onCta,
						size: "sm",
						className: "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
						children: ["Analyze ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
					}),
					userEmail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onSignOut,
						size: "sm",
						variant: "outline",
						className: "bg-background/40 border-border",
						title: "Sign out",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Sign out"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "bg-background/40 border-border",
							children: "Sign in"
						})
					})
				]
			})]
		})
	});
}
function Hero({ onCta }) {
	const shieldRef = (0, import_react.useRef)(null);
	const [tilt, setTilt] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	(0, import_react.useEffect)(() => {
		const handler = (e) => {
			const el = shieldRef.current;
			if (!el) return;
			const r = el.getBoundingClientRect();
			const cx = r.left + r.width / 2;
			const cy = r.top + r.height / 2;
			const dx = (e.clientX - cx) / window.innerWidth;
			setTilt({
				x: -((e.clientY - cy) / window.innerHeight) * 30,
				y: dx * 30
			});
		};
		window.addEventListener("mousemove", handler);
		return () => window.removeEventListener("mousemove", handler);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative overflow-hidden px-4 pt-20 pb-24 md:pt-28 md:pb-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "perspective-1000 relative mx-auto mb-10 flex size-32 items-center justify-center md:size-40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-full border-2 border-primary/40 animate-radar" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 rounded-full border-2 border-primary/40 animate-radar",
							style: { animationDelay: "0.8s" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 rounded-full border-2 border-neon-purple/40 animate-radar",
							style: { animationDelay: "1.6s" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							ref: shieldRef,
							className: "tilt-3d relative z-10 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 via-neon-purple/20 to-primary/5 border border-primary/40 glow-primary md:size-24",
							style: { transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)` },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
								className: "size-10 text-primary md:size-12",
								style: { transform: "translateZ(30px)" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent",
								style: { transform: "translateZ(15px)" }
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-safe animate-pulse" }), "AI-powered threat intelligence"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-gradient",
						children: "PhishGuard AI"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto",
					children: "Detect phishing emails instantly with AI. Paste a message, get a verdict in under two seconds."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 flex flex-wrap items-center justify-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onCta,
						size: "lg",
						className: "glow-primary h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
						children: ["Analyze Email Now ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), " Privacy-first · No data stored"]
					})]
				})
			]
		})
	});
}
function Tilt({ children, className = "", max = 10 }) {
	const ref = (0, import_react.useRef)(null);
	const [t, setT] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const onMove = (e) => {
		const el = ref.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width - .5;
		setT({
			x: -((e.clientY - r.top) / r.height - .5) * max,
			y: px * max
		});
	};
	const reset = () => setT({
		x: 0,
		y: 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `perspective-1000 ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref,
			onMouseMove: onMove,
			onMouseLeave: reset,
			className: "tilt-3d h-full",
			style: { transform: `rotateX(${t.x}deg) rotateY(${t.y}deg)` },
			children
		})
	});
}
function SectionHeader({ eyebrow, title, subtitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-center max-w-2xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs font-mono uppercase tracking-[0.2em] text-primary",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 text-3xl md:text-5xl font-bold tracking-tight",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted-foreground md:text-lg",
				children: subtitle
			})
		]
	});
}
function Field({ icon, label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-background/40 px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground",
			children: [
				icon,
				" ",
				label
			]
		}), children]
	});
}
function ResultPanel({ result, loading, onCopy, onShare, onExport }) {
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass rounded-2xl p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto size-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-full border-2 border-primary/30 animate-radar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-8 text-primary animate-pulse" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 font-mono text-sm text-muted-foreground",
			children: "Scanning indicators…"
		})]
	});
	if (!result) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass rounded-2xl p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mx-auto size-10 text-muted-foreground/60" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 font-semibold",
				children: "Awaiting input"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Your analysis will appear here."
			})
		]
	});
	const isPhish = result.verdict === "PHISHING";
	const accent = isPhish ? "danger" : "safe";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `flex items-center gap-3 rounded-xl border p-4 ${isPhish ? "border-danger/40 bg-danger/10" : "border-safe/40 bg-safe/10"}`,
				children: [isPhish ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-8 text-danger" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-8 text-safe" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `text-xs font-mono uppercase tracking-wider ${isPhish ? "text-danger" : "text-safe"}`,
					children: "Verdict"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xl font-bold",
					children: isPhish ? "🚨 Phishing Detected" : "✅ Safe"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-sm mb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Confidence"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono font-semibold",
						children: [result.confidence.toFixed(1), "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-2 overflow-hidden rounded-full bg-background/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `h-full rounded-full transition-all duration-1000 ${isPhish ? "bg-danger" : "bg-safe"}`,
						style: { width: `${Math.min(100, result.confidence)}%` }
					})
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Risk Level"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RiskBadge, { level: result.risk_level })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3",
					children: "Indicators"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-2",
					children: Object.entries(result.indicators).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndicatorRow, {
						label: prettyKey(k),
						flagged: v,
						accent
					}, k))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-xl border border-border bg-background/40 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2",
					children: "AI Explanation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed",
					children: result.explanation
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: onCopy,
						size: "sm",
						className: "border-border bg-transparent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), " Copy"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: onShare,
						size: "sm",
						className: "border-border bg-transparent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-3.5" }), " Share"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onExport,
						size: "sm",
						className: "col-span-2 glow-primary bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "size-3.5" }), " Export PDF Report"]
					})
				]
			})
		]
	});
}
function IndicatorRow({ label, flagged, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-lg border border-border/60 bg-background/30 px-3 py-2 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: flagged ? "text-foreground" : "text-muted-foreground",
			children: label
		}), flagged ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: `inline-flex items-center gap-1 text-xs font-semibold ${accent === "danger" ? "text-danger" : "text-warning"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3.5" }), " Flagged"]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-1 text-xs text-safe/80",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), " Clear"]
		})]
	});
}
function RiskBadge({ level }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `rounded-md border px-2.5 py-0.5 text-xs font-semibold ${{
			Critical: "bg-danger/20 text-danger border-danger/40",
			High: "bg-danger/15 text-danger border-danger/30",
			Medium: "bg-neon-purple/15 text-neon-purple border-neon-purple/40",
			Low: "bg-safe/15 text-safe border-safe/30"
		}[level] ?? ""}`,
		children: level
	});
}
function prettyKey(k) {
	return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function HistoryPanel({ items }) {
	if (!items.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass rounded-2xl p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "Recent scans"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-lg border border-border bg-background/30 px-3 py-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate font-medium",
						children: it.subject
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: new Date(it.ts).toLocaleTimeString()
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `ml-2 rounded-md px-2 py-0.5 text-xs font-semibold ${it.verdict === "PHISHING" ? "bg-danger/15 text-danger" : "bg-safe/15 text-safe"}`,
					children: it.verdict
				})]
			}, it.id))
		})]
	});
}
function HowItWorks() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "px-4 py-20 md:py-28 border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "Workflow",
				title: "How it works",
				subtitle: "Three steps from suspicious message to clear verdict."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid gap-6 md:grid-cols-3",
				children: [
					{
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-6" }),
						title: "Paste Email",
						desc: "Drop the subject, sender, and body into the analyzer."
					},
					{
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6" }),
						title: "AI Analyzes",
						desc: "Our model inspects links, language, and sender signals."
					},
					{
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-6" }),
						title: "Get Result",
						desc: "Receive a verdict, confidence score, and breakdown."
					}
				].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass rounded-2xl p-6 relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute -top-3 left-6 rounded-md bg-primary px-2 py-0.5 text-xs font-mono font-bold text-primary-foreground",
							children: ["0", i + 1]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30",
							children: s.icon
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 font-semibold text-lg",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: s.desc
						})
					]
				}, i))
			})]
		})
	});
}
function Features() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "px-4 py-20 md:py-28 border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				eyebrow: "Capabilities",
				title: "Built to catch what slips past you",
				subtitle: "Every scan runs the same defense-in-depth pipeline."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3",
				children: [
					{
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {}),
						title: "Real-time AI Analysis",
						desc: "Sub-second classification powered by frontier models."
					},
					{
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {}),
						title: "Multi-indicator Detection",
						desc: "15+ heuristic and semantic signals checked."
					},
					{
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}),
						title: "Confidence Scoring",
						desc: "Calibrated percentage so you know how sure we are."
					},
					{
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSearch, {}),
						title: "Detailed Reports",
						desc: "See exactly which indicators triggered the verdict."
					},
					{
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {}),
						title: "Instant Results",
						desc: "Most scans return in under two seconds."
					},
					{
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {}),
						title: "Privacy First",
						desc: "We never store the email content you paste."
					}
				].map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tilt, {
					max: 12,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass rounded-2xl p-6 h-full transition hover:border-neon-purple/40 hover:glow-purple",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30 [&_svg]:size-5",
								style: { transform: "translateZ(40px)" },
								children: f.icon
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-4 font-semibold",
								style: { transform: "translateZ(20px)" },
								children: f.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: f.desc
							})
						]
					})
				}, i))
			})]
		})
	});
}
function Stats() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "px-4 py-20 md:py-28 border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-6xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "glass rounded-3xl p-8 md:p-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-8 md:grid-cols-4",
					children: [
						{
							value: 5e4,
							suffix: "+",
							label: "Emails Analyzed"
						},
						{
							value: 99.2,
							suffix: "%",
							label: "Detection Accuracy",
							decimals: 1
						},
						{
							value: 2,
							prefix: "<",
							suffix: "s",
							label: "Analysis Time"
						},
						{
							value: 15,
							suffix: "+",
							label: "Phishing Indicators"
						}
					].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-4xl md:text-5xl font-bold text-gradient font-mono",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Counter, {
								value: s.value,
								decimals: s.decimals,
								prefix: s.prefix,
								suffix: s.suffix
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 text-sm text-muted-foreground",
							children: s.label
						})]
					}, i))
				})
			})
		})
	});
}
function Counter({ value, decimals = 0, prefix = "", suffix = "" }) {
	const [n, setN] = (0, import_react.useState)(0);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				const start = performance.now();
				const dur = 1500;
				const tick = (now) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		ref,
		children: [
			prefix,
			n.toLocaleString(void 0, {
				maximumFractionDigits: decimals,
				minimumFractionDigits: decimals
			}),
			suffix
		]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "px-4 py-12 border-t border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl grid gap-8 md:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-6 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-bold tracking-tight",
						children: ["PhishGuard ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-primary",
							children: "AI"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground max-w-xs",
					children: "AI-powered phishing email detection. Built for individuals and security teams."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-wider text-muted-foreground mb-3",
					children: "Links"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#",
							className: "hover:text-primary transition",
							children: "About"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#",
							className: "hover:text-primary transition",
							children: "Privacy Policy"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#",
							className: "hover:text-primary transition",
							children: "Contact"
						}) })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:text-right",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs uppercase tracking-wider text-muted-foreground mb-3",
							children: "Made with"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: ["Built with AI by ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gradient font-semibold",
								children: "Muniba Akram"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-2",
							children: "© 2025 PhishGuard AI"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { PhishGuardPage as component };
