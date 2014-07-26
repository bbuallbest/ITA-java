package com.softserveinc.ita.service.impl;

import com.softserveinc.ita.dao.GroupDao;
import com.softserveinc.ita.entity.Applicant;
import com.softserveinc.ita.entity.Course;
import com.softserveinc.ita.entity.Group;
import com.softserveinc.ita.exception.impl.GroupDoesntExistException;
import com.softserveinc.ita.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class GroupServiceImpl implements GroupService {

    @Autowired
    private GroupDao groupDao;

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ArrayList<Group> getGroupsByStatus(Group.Status groupStatus){
        ArrayList<Group> groups = groupDao.getAllGroups();
        ArrayList<Group> choosenGroups = new ArrayList<>();
        long currentTime = System.currentTimeMillis();
        for (Group group : groups) {
            switch (groupStatus) {
                case PLANNED:
                    if (currentTime < group.getStartBoardingTime()) {
                        choosenGroups.add(group);
                    }
                    break;
                case BOARDING:
                    if (currentTime > group.getStartBoardingTime() && currentTime < group.getStartTime()) {
                        choosenGroups.add(group);
                    }
                    break;
                case IN_PROCESS:
                    if (currentTime > group.getStartTime() && currentTime < group.getEndTime()) {
                        choosenGroups.add(group);
                    }
                    break;
                case FINISHED:
                    if (currentTime > group.getEndTime()) {
                        choosenGroups.add(group);
                    }
                    break;

            }
        }
        return choosenGroups;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ArrayList<Course> getCourses() {
        return groupDao.getCourses();
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Group createGroup(Group group) {
        return groupDao.addGroup(group);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ArrayList<Group> getAllGroups() {
        return groupDao.getAllGroups();
    }

    private boolean isWrongStatus(Group.Status groupStatus) {
        for(Group.Status status : Group.Status.values()){
            if (status.equals(groupStatus)) {
                return false;
            }
        }
        return true;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public List<Applicant> getApplicantsByGroupID(String groupID) throws GroupDoesntExistException {
        return groupDao.getApplicantsByGroupID(groupID);
    }
}
