package com.medibook.core;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class Schema implements InitializingBean {
  private final Db db;
  private final TransactionTemplate transaction;

  public Schema(Db db, PlatformTransactionManager manager) {
    this.db = db;
    transaction = new TransactionTemplate(manager);
  }

  public void afterPropertiesSet() {
    db.jdbc.execute("CREATE TABLE IF NOT EXISTS medibook_migrations (version INTEGER PRIMARY KEY)");
    transaction.executeWithoutResult(
        s -> {
          if (db.jdbc.queryForObject(
                  "SELECT COUNT(*) FROM medibook_migrations WHERE version=1", Integer.class)
              == 0) {
            db.jdbc.execute(
                (org.springframework.jdbc.core.ConnectionCallback<Void>)
                    c -> {
                      ScriptUtils.executeSqlScript(c, new ClassPathResource("db/core.sql"));
                      return null;
                    });
            db.jdbc.update("INSERT INTO medibook_migrations(version) VALUES (1)");
          }
        });
  }
}
