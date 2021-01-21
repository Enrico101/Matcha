# Matcha
Matcha is a website that enables users to share there location via geolocation in order find the best match for love

# Requirements
1. NodeJS
2. MySQL
3. Javascript
4. HTML
5. CSS
6. MySQL workbench or anything relevant

# Application setup
1. Install the NodeJS version for your operating system.
2. Clone the repository onto your pc
3. In the repository, you will find a file called "package.json". This files contains all the modules that matcha requires.
4. Run the commnd "npm install". This command will install all the required modules.
5. Either set your MySQL credentials to "user: root, password: Root444@" or modify the database file to your custom login credentials.
6. Run the command "node create_matcha.js". This command will create the mysql databse and necessary folders required by mathca.

# Application usage

1) First signup and verify your account

2) Then login to verify your account works

3) Once logged on, You will have these sections: Profile, Home, Search, Chat, View history, Visit history, Like history, Profile setting.

4) The home page is where you will get all the recommended potential matches.

5) The search pqge is where you specify your own criteria for potential matches.

6) The chat page is where you go to communicate in real time with your matches or report them.

7) The View history page is where all the people that viewed your profile will appear.

8) The Visit history pqge is where your past visits to other peoples profiles will appear.

9) The like page is where all the people that you likes will appear.

10) The profile settings page is where you go to update any information thats related to your profile.

# File structure
```bash
.
├── README.md
├── app.js
├── author
├── create_matcha.js
├── database.js
├── index_images                                                │   ├── 29000056.jpg
│   └── red watercolour background 1412.jpg                     ├── objects.js
├── package-lock.json
├── package.json
├── routes
│   ├── admin.js
│   ├── authenticate.js
│   ├── block.js
│   ├── block_requests.js
│   ├── chat.js
│   ├── chat_navigation.js
│   ├── check_profile.js
│   ├── complete_profile.js
│   ├── forgot_password.js
│   ├── home.js
│   ├── index.js
│   ├── like.js
│   ├── like_history.js
│   ├── login.js
│   ├── logout.js
│   ├── profile.js
│   ├── profile_settings.js
│   ├── report_user.js
│   ├── reset_password.js
│   ├── search.js
│   ├── selected_pic.js
│   ├── set_profile_pic.js
│   ├── signup.js
│   ├── unlike.js
│   ├── user_profile.js
│   ├── verfify.js
│   ├── verify_token.js
│   ├── view_history.js
│   └── visit_history.js
├── update_username_obj.js
└── views
    ├── admin.ejs
    ├── blocked_users.ejs
    ├── change_profile_pic.ejs
    ├── chat.ejs
    ├── chat_navigation.ejs
    ├── forgot_password.ejs
    ├── home.ejs
    ├── index.ejs
    ├── like_history.ejs
    ├── login.ejs
    ├── photo.ejs
    ├── profile.ejs
    ├── profile_settings_index.ejs
    ├── reset_password.ejs
    ├── search.ejs
    ├── set_profile.ejs
    ├── set_profile_pic.ejs
    ├── signup.ejs
    ├── update_age.ejs
    ├── update_bio.ejs
    ├── update_email.ejs
    ├── update_firstname.ejs
    ├── update_interests.ejs
    ├── update_lastname.ejs
    ├── update_location.ejs
    ├── update_password.ejs
    ├── update_prefence.ejs
    ├── update_preferred_distance.ejs
    ├── update_username.ejs
    ├── upload_images.ejs
    ├── user_profile.ejs
    ├── view_history.ejs
    └── visit_history.ejs

3 directories, 73 files
```

