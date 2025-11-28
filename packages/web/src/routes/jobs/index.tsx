import { createFileRoute } from "@tanstack/react-router";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { jobsAtom } from "../../atoms/api";
import type { Job } from "@ats/shared";

export const Route = createFileRoute("/jobs/")({
	component: JobsPage,
});

function JobsPage() {
	const result = useAtomValue(jobsAtom);

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 24,
				}}
			>
				<h1>Jobs</h1>
				<button
					style={{
						background: "#fff",
						color: "#000",
						padding: "8px 16px",
						borderRadius: 6,
						border: "none",
						cursor: "pointer",
						fontSize: 14,
						fontWeight: 500,
					}}
				>
					+ New Job
				</button>
			</div>
			{Result.builder(result)
				.onInitial(() => <div>Loading...</div>)
				.onSuccess((data) => <JobsList jobs={data} />)
				.onFailure((err) => <div style={{ color: "#f87171" }}>Error: {String(err)}</div>)
				.onDefect(() => <div style={{ color: "#f87171" }}>Crash!</div>)
				.render()}
		</div>
	);
}

function JobsList({ jobs }: { jobs: Job[] }) {
	if (jobs.length === 0) {
		return (
			<div style={{ color: "#888" }}>
				No jobs yet. Create your first job posting!
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			{jobs.map((job: Job) => (
				<div
					key={job.id}
					style={{
						display: "block",
						background: "#1a1a1a",
						border: "1px solid #333",
						borderRadius: 8,
						padding: 16,
						cursor: "pointer",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div>
							<div style={{ fontWeight: 500, marginBottom: 4 }}>
								{job.title}
							</div>
							<div style={{ color: "#888", fontSize: 14 }}>
								{job.location.type === "remote"
									? "Remote"
									: job.location.city}{" "}
								· {job.employmentType.replace("_", " ")}
							</div>
						</div>
						<StatusBadge status={job.status} />
					</div>
				</div>
			))}
		</div>
	);
}

function StatusBadge({ status }: { status: Job["status"] }) {
	const colors: Record<Job["status"], { bg: string; text: string }> = {
		draft: { bg: "#333", text: "#888" },
		open: { bg: "#166534", text: "#4ade80" },
		paused: { bg: "#854d0e", text: "#fbbf24" },
		closed: { bg: "#1e3a8a", text: "#60a5fa" },
		archived: { bg: "#333", text: "#666" },
	};
	const { bg, text } = colors[status];
	return (
		<span
			style={{
				background: bg,
				color: text,
				padding: "4px 8px",
				borderRadius: 4,
				fontSize: 12,
				fontWeight: 500,
				textTransform: "capitalize",
			}}
		>
			{status}
		</span>
	);
}
