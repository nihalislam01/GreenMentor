create table user(
    user_id int primary key AUTO_INCREMENT,
    first_name varchar(150) not null,
    last_name varchar(150) not null,
    email varchar(100) not null,
    password varchar(100) not null,
    phone_no char(14),
    birth_date date,
    image varchar(100),
    license varchar(500),
    admin boolean not null,
    non_premium boolean not null,
    premium boolean not null,
    UNIQUE (email)
);

create table plant(
    plant_id int primary key AUTO_INCREMENT,
    name varchar(150) not null,
    image_url varchar(250),
    watering varchar(100),
    admin_user_id int not null,
    foreign key (admin_user_id) references user(user_id)
);

create table event(
    event_id int primary key AUTO_INCREMENT,
    title varchar(100) not null,
    start_date date not null,
    end_date date not null,
    location varchar(250),
    description varchar(500),
    admin_user_id int not null,
    foreign key (admin_user_id) references user(user_id)
);

create table post(
    post_id int primary key AUTO_INCREMENT,
    image varchar(100) not null,
    location varchar(100),
    date date not null,
    description varchar(500),
    likes int not null,
    premium_user_id int not null,
    foreign key (premium_user_id) references user(user_id)
);

create table user_add_plant(
    general_user_id int not null,
    plant_id int not null,
    foreign key (general_user_id) references user(user_id),
    foreign key (plant_id) references plant(plant_id)
);

create table user_register_event(
    general_user_id int not null,
    event_id int not null,
    foreign key (general_user_id) references user(user_id),
    foreign key (event_id) references event(event_id)
);

create table user_like_post(
    user_id int not null,
    post_id int not null,
    foreign key (user_id) references user(user_id),
    foreign key (post_id) references post(post_id)

);

create table participation(
    participation_id int primary key AUTO_INCREMENT,
    image varchar(100) not null,
    plant_name varchar(100) not null,
    status boolean,
    general_user_id int not null,
    event_id int not null,
    foreign key (general_user_id) references user(user_id),
    foreign key (event_id) references event(event_id)
);

create table payment(
    payment_id int primary key AUTO_INCREMENT,
    card_no varchar(20) not null,
    pin char(6) not null,
    payment_date date not null,
    status boolean not null,
    general_user_id int not null,
    foreign key (general_user_id) references user(user_id)
);

create table sunlight(
    plant_id int not null,
    sunlight varchar(50) not null,
    foreign key (plant_id) references plant(plant_id)
);