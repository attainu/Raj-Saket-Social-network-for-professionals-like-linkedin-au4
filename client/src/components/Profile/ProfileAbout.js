import React from "react";
import PropTypes from "prop-types";

const ProfileAbout = ({
  profile: {
    bio,
    skills,
    user: { name },
  },
}) => {
  return (
    <div class="profile-about bg-light p-2">
      {bio && (
        <div>
          <h2 class="text-primary">{name.split(" ")[0]}'s Bio</h2>
          <p>{bio}</p>
          <div class="line"></div>
        </div>
      )}

      <h2 class="text-primary">Skill Set</h2>
      <div class="skills">
        {skills.map((skill, index) => {
          return (
            <div className="p-1">
              <i className="fas fa-check"></i> {skill}
            </div>
          );
        })}
      </div>
    </div>
  );
};

ProfileAbout.propTypes = {
  profile: PropTypes.object.isRequired,
};

export default ProfileAbout;
