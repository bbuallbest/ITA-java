package com.softserveinc.ita.service;

        import com.softserveinc.ita.dao.ApplicantDAO;
        import com.softserveinc.ita.entity.Applicant;
        import com.softserveinc.ita.exception.ApplicantDoesNotExistException;
        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.stereotype.Service;

@Service
public class ApplicantServiceImpl implements ApplicantService {

    @Autowired
    private ApplicantDAO applicantDAOMockImpl;

    public Applicant getApplicantById(String applicantId) throws ApplicantDoesNotExistException {
        Applicant searchedApplicant = applicantDAOMockImpl.getApplicantById(applicantId);
        if(searchedApplicant==null){
            throw new ApplicantDoesNotExistException();
        }
        return searchedApplicant;
    }
}
