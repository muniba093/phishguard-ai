import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CJCEtu0k.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { N as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Toaster$1, t as Button } from "./sonner-ksNSMzZV.mjs";
import { C as LoaderCircle, l as Lock, n as Shield, s as Mail, y as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DwHlc4lI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lovableAuth = createLovableAuth();
var lovable = { auth: { signInWithOAuth: async (provider, opts) => {
	const result = await lovableAuth.signInWithOAuth(provider, {
		redirect_uri: opts?.redirect_uri,
		extraParams: { ...opts?.extraParams }
	});
	if (result.redirected) return result;
	if (result.error) return result;
	try {
		await supabase.auth.setSession(result.tokens);
	} catch (e) {
		return { error: e instanceof Error ? e : new Error(String(e)) };
	}
	return result;
} } };
function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [googleLoading, setGoogleLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({ to: "/" });
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
			if (session) navigate({ to: "/" });
		});
		return () => sub.subscription.unsubscribe();
	}, [navigate]);
	const handleEmail = async (e) => {
		e.preventDefault();
		if (!email || !password) return toast.error("Enter email and password");
		setLoading(true);
		try {
			if (mode === "signup") {
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: { emailRedirectTo: window.location.origin }
				});
				if (error) throw error;
				toast.success("Account created. You're signed in!");
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
				toast.success("Welcome back!");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Authentication failed");
		} finally {
			setLoading(false);
		}
	};
	const handleGoogle = async () => {
		setGoogleLoading(true);
		try {
			const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
			if (result.error) toast.error(result.error.message || "Google sign-in failed");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Google sign-in failed");
		} finally {
			setGoogleLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex items-center justify-center px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				theme: "dark",
				position: "top-center",
				richColors: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 -z-10 overflow-hidden pointer-events-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/4 left-1/4 size-96 rounded-full bg-primary/20 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-1/4 right-1/4 size-96 rounded-full bg-neon-purple/20 blur-3xl" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center justify-center gap-2 mb-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-8 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 blur-md bg-primary/40 -z-10" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-xl tracking-tight",
							children: ["PhishGuard", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary",
								children: " AI"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass rounded-2xl p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-bold tracking-tight",
								children: mode === "signin" ? "Welcome back" : "Create your account"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: mode === "signin" ? "Sign in to scan emails for phishing threats." : "Get instant AI-powered phishing detection."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								onClick: handleGoogle,
								disabled: googleLoading || loading,
								variant: "outline",
								className: "mt-6 h-11 w-full bg-background/40 border-border hover:bg-accent",
								children: [googleLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, {}), "Continue with Google"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" }),
									"or",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleEmail,
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5" }), " Email"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "email",
											autoComplete: "email",
											value: email,
											onChange: (e) => setEmail(e.target.value),
											placeholder: "you@example.com",
											className: "w-full rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }), " Password"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "password",
											autoComplete: mode === "signin" ? "current-password" : "new-password",
											value: password,
											onChange: (e) => setPassword(e.target.value),
											placeholder: "••••••••",
											minLength: 6,
											className: "w-full rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										disabled: loading || googleLoading,
										className: "glow-primary h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
										children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [mode === "signin" ? "Sign in" : "Create account", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })] })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-6 text-center text-sm text-muted-foreground",
								children: [
									mode === "signin" ? "New to PhishGuard?" : "Already have an account?",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
										className: "font-semibold text-primary hover:underline",
										children: mode === "signin" ? "Create one" : "Sign in"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-center text-xs text-muted-foreground",
						children: "Privacy-first · Your emails are never stored"
					})
				]
			})
		]
	});
}
function GoogleIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "size-4",
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "#EA4335",
			d: "M12 10.2v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "#4285F4",
			d: "M21.1 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.2 1.4-1.7 4.2-5.5 4.2v.7l4 3.1c2.3-2.1 3.6-5.3 3.6-9.3z",
			opacity: ".0"
		})]
	});
}
//#endregion
export { AuthPage as component };
