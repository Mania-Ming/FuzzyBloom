-- =============================================
-- FIX: FK CASCADE for safe order deletion
-- Run this in your Supabase SQL Editor
-- =============================================

-- order_items: add ON DELETE CASCADE
alter table order_items drop constraint if exists order_items_order_id_fkey;
alter table order_items
  add constraint order_items_order_id_fkey
  foreign key (order_id) references orders(id) on delete cascade;

-- delivery_details: add ON DELETE CASCADE
alter table delivery_details drop constraint if exists delivery_details_order_id_fkey;
alter table delivery_details
  add constraint delivery_details_order_id_fkey
  foreign key (order_id) references orders(id) on delete cascade;

-- order_status_history: add ON DELETE CASCADE
alter table order_status_history drop constraint if exists order_status_history_order_id_fkey;
alter table order_status_history
  add constraint order_status_history_order_id_fkey
  foreign key (order_id) references orders(id) on delete cascade;

-- Allow admin (authenticated) to delete delivery_details
drop policy if exists "Admin can delete delivery details" on delivery_details;
create policy "Admin can delete delivery details"
  on delivery_details for delete
  to authenticated
  using (true);

-- Allow admin to read all delivery_details (for admin panel)
drop policy if exists "Admin can read all delivery details" on delivery_details;
create policy "Admin can read all delivery details"
  on delivery_details for select
  to authenticated
  using (true);
