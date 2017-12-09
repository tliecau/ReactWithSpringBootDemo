package com.managersandemployees.Entites.Repositories;

import com.managersandemployees.Entites.Manager;
import org.springframework.data.repository.Repository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(exported = false)
// Spring Data REST, by default, will export any repository it finds.
// You do NOT want this repository exposed for REST operations!
// Apply the @RepositoryRestResource(exported = false) annotation to block it from export.
// This prevents the repository from being served up as well as any metadata.
public interface ManagerRepository extends Repository<Manager, Long> {

    Manager save(Manager manager);

    Manager findByName(String name);
}


