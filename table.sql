create table user(
    user_id int primary key AUTO_INCREMENT,
    first_name varchar(150) not null,
    last_name varchar(150) not null,
    email varchar(100) not null,
    password varchar(100) not null,
    phone_no char(14),
    birth_date date,
    license varchar(500),
    admin boolean not null,
    non_premium boolean not null,
    premium boolean not null,
    UNIQUE (email)
);

insert into user(first_name,last_name,email,password,license,admin,non_premium,premium) values('admin1','user','admin1@gmail.com','admin','license1',1,0,0);
insert into user(first_name,last_name,email,password,admin,non_premium,premium) values('general1','user','general1@gmail.com','general',0,1,0);
insert into user(first_name,last_name,email,password,admin,non_premium,premium) values('general2','user','general2@gmail.com','general',0,1,1);

create table plant(
    plant_id int primary key AUTO_INCREMENT,
    name varchar(150) not null,
    image_url varchar(250),
    watering varchar(100),
    admin_user_id int not null,
    foreign key (admin_user_id) references user(user_id)
);

insert into plant(name,image_url,watering,admin_user_id)  values
('European Silver Fir','https://perenual.com/storage/species_image/1_abies_alba/og/1536px-Abies_alba_SkalitC3A9.jpg','Frequent',1),
('Pyramidalis Silver Fir','https://perenual.com/storage/species_image/2_abies_alba_pyramidalis/og/49255769768_df55596553_b.jpg','Average',1),
('White Fir','https://perenual.com/storage/species_image/3_abies_concolor/og/52292935430_f4f3b22614_b.jpg','Average',1),
('Candicans White Fir','https://perenual.com/storage/species_image/4_abies_concolor_candicans/og/49283844888_332c9e46f2_b.jpg','Average',1),
('Fraser Fir','https://perenual.com/storage/species_image/5_abies_fraseri/og/36843539702_e80fc436e0_b.jpg','Frequent',1),
('Golden Korean Fir','https://perenual.com/storage/species_image/6_abies_koreana_aurea/og/49235570926_99ec10781d_b.jpg','Average',1),
('Alpine Fir','https://perenual.com/storage/species_image/7_abies_lasiocarpa/og/51002756843_74fae3c2fa_b.jpg','Average',1),
('Noble Fir','https://perenual.com/storage/species_image/9_abies_procera/og/49107504112_6bd7effb8b_b.jpg','Average',1),
('Johin Japanese Maple','https://perenual.com/storage/species_image/10_acer_johin/og/pexels-photo-2183508.jpg','Average',1);


create table event(
    event_id int primary key AUTO_INCREMENT,
    start_date date not null,
    end_date date not null,
    location varchar(250),
    admin_user_id int not null,
    foreign key (admin_user_id) references user(user_id)
);

create table reminder(
    reminder_id int primary key AUTO_INCREMENT,
    hour char(2) not null,
    minute char(2) not null,
    general_user_id int not null,
    foreign key (general_user_id) references user(user_id)
);

create table post(
    post_id int primary key AUTO_INCREMENT,
    image blob,
    description varchar(500),
    premium_user_id int not null,
    foreign key (premium_user_id) references user(user_id)
);

create table user_add_plant(
    general_user_id int not null,
    plant_id int not null,
    foreign key (general_user_id) references user(user_id),
    foreign key (plant_id) references plant(plant_id)
);

create table user_participate_event(
    general_user_id int not null,
    event_id int not null,
    image blob not null,
    user_count boolean not null,
    foreign key (general_user_id) references user(user_id),
    foreign key (event_id) references event(event_id)
);

create table event_associated_with_plant(
    plant_id int,
    event_id int not null,
    plant_count boolean not null,
    foreign key (plant_id) references plant(plant_id),
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