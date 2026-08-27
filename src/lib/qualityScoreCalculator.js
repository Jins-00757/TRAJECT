

export const calculateQualityScore = (application) => { 
    



     // 🎉 If application reached OFFER, it's automatically perfect (100%)
  if (application.status && application.status.toLowerCase() === 'offer') {
    return 100;
  }
    
    let score = 0; 

// Check BOTH API data AND localStorage
const resumeFromLocal = localStorage.getItem(`resume_${application.id}`);
const resumeFromAPI = application.resume && application.resume.trim() !== '';
if (resumeFromAPI || resumeFromLocal) score += 20;

const coverLetterFromLocal = localStorage.getItem(`coverLetter_${application.id}`);
const coverLetterFromAPI = application.coverLetter && application.coverLetter.trim() !== '';
if (coverLetterFromAPI || coverLetterFromLocal) score += 20;

   
        const interviewCount = application.interviews ? application.interviews.length : 0; score += Math.min(interviewCount * 15, 30);
         
           // 5. Notes (15 points)
           if (application.notes && application.notes.trim() && application.notes.length > 20) { score += 15; } 
           // 6. Freshness Bonus (10 points for recent activity)
            if (application.updatedAt) { 
                const daysSinceUpdate = Math.floor( (new Date() - new Date(application.updatedAt)) / (1000 * 60 * 60 * 24) ); if (daysSinceUpdate <= 7) {
                     score += 10; } }
                      return Math.min(score, 100); 
                     };
                       export const getQualityStatus = (score) => { 
                        if (score >= 80)
                             return {
                             status: 'Excellent', color: '#10b981', icon: '⭐' };
                              if (score >= 60)
                                 return {
                                 status: 'Good', color: '#3b82f6', icon: '✓' };
                                  if (score >= 40)
                                     return { 
                                    status: 'Fair', color: '#f59e0b', icon: '⚠️' }; 
                                    return { 
                                        status: 'Needs Work', color: '#ef4444', icon: '✕'
                                     };
                                     };