package com.managersandemployees.Entites;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

// @Data is a Project Lombok annotation to autogenerate getters,
// setters, constructors, toString, hash, equals, and other things. It cuts down on the boilerplate.

@Data
@Entity
public class Employee {

    private @Id @GeneratedValue Long id;
    private String firstName;
    private String lastName;
    private String description;

    private @ManyToOne
    Manager manager;

    private Employee() {}

    public Employee(String firstName, String lastName, String description, Manager manager) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.description = description;
        this.manager = manager;
    }
}
