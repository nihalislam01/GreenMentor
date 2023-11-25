create table user(
    user_id int primary key AUTO_INCREMENT,
    first_name varchar(150),
    last_name varchar(150),
    email varchar(100),
    password varchar(100),
    license varchar(500),
    admin boolean,
    non_premium boolean,
    premium boolean,
    UNIQUE (email)
);

insert into user(first_name,last_name,email,password,license,admin,non_premium,premium) values('admin1','user','admin1@gmail.com','admin','license1',1,0,0);