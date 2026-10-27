const JOB_WORKFLOW_STATE_KEY = 'rkbm_job_workflow_state'

export function getJobWorkflowState() {
  try {
    return JSON.parse(window.localStorage.getItem(JOB_WORKFLOW_STATE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export function getJobWorkflowPatch(jobId) {
  return getJobWorkflowState()[jobId] ?? {}
}

export function applyJobWorkflowPatch(job) {
  const patch = getJobWorkflowPatch(job.id)
  return {
    ...job,
    ...patch,
    activities: patch.activities?.length ? patch.activities : job.activities,
  }
}

export function updateJobWorkflowPatch(jobId, updater) {
  const current = getJobWorkflowState()
  const patch = current[jobId] ?? {}
  const nextPatch = typeof updater === 'function' ? updater(patch) : { ...patch, ...updater }
  window.localStorage.setItem(JOB_WORKFLOW_STATE_KEY, JSON.stringify({ ...current, [jobId]: nextPatch }))
  return nextPatch
}
