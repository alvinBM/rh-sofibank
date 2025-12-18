-- Add 'hired' status to job_applications status ENUM
ALTER TABLE job_applications 
MODIFY COLUMN status ENUM(
    'new',
    'screening',
    'shortlisted',
    'interview_scheduled',
    'interviewed',
    'assessment',
    'offer_pending',
    'offer_sent',
    'offer_accepted',
    'offer_declined',
    'rejected',
    'withdrawn',
    'hired'
) DEFAULT 'new';
