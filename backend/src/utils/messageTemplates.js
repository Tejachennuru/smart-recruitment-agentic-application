export const generateWhatsAppMessage = (jobTitle, formUrl, companyName = 'Our Company') => {
  return `🎯 *Exciting Opportunity at ${companyName}!*

We're hiring for: *${jobTitle}*

We'd love to hear from you! 🚀

📝 Please fill out this quick application form:
${formUrl}

Looking forward to your application! 

Best regards,
HR Team`;
};

export const generateJobSummary = (job) => {
  return `
**${job.job_title}**

📋 Description:
${job.description}

🎓 Qualifications:
${job.qualifications || 'Not specified'}

💼 Required Skills:
${job.required_skills?.join(', ') || 'Not specified'}

👥 Candidates Needed: ${job.candidates_needed}

📅 Application Deadline: ${job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'Not specified'}

📧 Contact: ${job.contact_email}
`.trim();
};