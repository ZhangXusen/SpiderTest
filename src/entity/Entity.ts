import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Good {
	@PrimaryGeneratedColumn()
	id: number;

	//名称
	@Column()
	name: string;

	//价格
	@Column("decimal")
	prices: number;

	//标签
	@Column({
		type: "simple-array",
	})
	tags: string[];

	//轮播图
	@Column("simple-array")
	carousels: string[];

	//规格参数/属性
	@Column("simple-json")
	attrs: Object[];

	//详情信息
	@Column({
		type: "text",
	})
	description: string;
}

// @Entity()
// export class Tag {
// 	@PrimaryGeneratedColumn()
// 	id: number;

// 	@Column()
// 	name: string;

// 	@ManyToMany(() => Good)
// 	@JoinTable()
// 	goods: Good[];
// }

// @Entity()
// export class Carousel {
// 	@PrimaryGeneratedColumn()
// 	id: number;

// 	@Column()
// 	imageUrl: string;

// 	@ManyToOne(() => Good, (good) => good.carousels)
// 	@JoinColumn()
// 	good: Good;
// }
