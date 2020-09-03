import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Post } from '../models/post';
import { PostService } from '../services/post.service';
import { FileInput } from 'ngx-material-file-input';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})
export class AddPostComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar,
    private router: Router, private postService: PostService) { }

  addPostForm: FormGroup;
  categories = ['Improve', 'Song', 'Lesson', 'Challenge', 'Discussion'];
  types = ['Audio', 'Video', 'Text', 'Image', 'Link'];
  fileName: string;

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.addPostForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      category: ['', [Validators.required]],
      type: ['', [Validators.required]],
      tags: this.formBuilder.array([
        new FormControl()
      ]),
      instruments: this.formBuilder.array([
        new FormControl()
      ]),
      description: ['', [Validators.maxLength(250)]],
      file: ['']
    });
  }

  addTag() {
    const control = this.addPostForm.controls.tags as FormArray;
    control.push(new FormControl());
  }

  removeTag(index: number) {
    const control = this.addPostForm.controls.tags as FormArray;
    control.removeAt(index);
  }

  addInstrument() {
    const control = this.addPostForm.controls.instruments as FormArray;
    control.push(new FormControl());
  }

  removeInstrument(index: number) {
    const control = this.addPostForm.controls.instruments as FormArray;
    control.removeAt(index);
  }

  get title() { return this.addPostForm.controls.title.value as string; }
  get category() { return this.addPostForm.controls.category.value as string; }
  get type() { return this.addPostForm.controls.type.value as string; }
  get location() { return this.addPostForm.controls.location.value as string; }
  get instruments() { return this.addPostForm.controls.instruments.value as string[]; }
  get tags() { return this.addPostForm.controls.tags.value as string[]; }
  get description() { return this.addPostForm.controls.description.value as string; }
  get file() { return this.addPostForm.controls.file.value as FileInput; }
  checkType() {
    if (this.type === 'Link') {
      this.addPostForm.addControl('location', new FormControl('', Validators.required));
    }

    return this.type;
  }

  onAddPostSubmit() {

    const newPost = new Post(this.title, this.category, this.description, this.type, '', this.instruments, this.tags, []);

    if (this.type === 'Link') {
      newPost.location = this.location;
    }

    this.postService.addPost(newPost).subscribe(
      (response => {

        const formData: FormData = new FormData();
        formData.append('file', this.file.files[0]);
        formData.append('type', this.type);

        formData.append('fileName', response.id);
        this.postService.uploadFile(formData).subscribe(() => {
        }, err => {
          this.snackBar.open(err);
        });

        this.createForm();
        this.snackBar.open('Successfully added new post.');
      })
    );

  }

  trackByFn(index: any, item: any) {
    return index;
 }

 trackByFn2(index: any, item: any) {
  return index;
}

}
