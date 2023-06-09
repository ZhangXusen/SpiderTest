create table my_spider.good
(
    id          int auto_increment
        primary key,
    name        varchar(255) not null,
    tags        text         not null,
    carousels   text         not null,
    attrs       text         not null,
    prices      decimal      not null,
    description text         not null
);


